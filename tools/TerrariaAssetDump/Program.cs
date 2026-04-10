using System.Reflection;
using System.Runtime.Loader;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Content;
using Microsoft.Xna.Framework.Graphics;

var jsonOptions = new JsonSerializerOptions
{
  WriteIndented = true
};

var repoRoot = FindRepoRoot();
var terrariaRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Steam", "steamapps", "common", "Terraria");
var tmlRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Steam", "steamapps", "common", "tModLoader");
var nativeRoot = Path.Combine(tmlRoot, "Libraries", "Native", "Windows");

EnsurePath(terrariaRoot, "Terraria installation");
EnsurePath(tmlRoot, "tModLoader installation");

Environment.SetEnvironmentVariable(
  "PATH",
  string.Join(";", new[]
  {
    nativeRoot,
    Environment.GetEnvironmentVariable("PATH") ?? string.Empty
  }));

RegisterResolvers(tmlRoot);

var itemIdMap = LoadConstantMap(Path.Combine(tmlRoot, "tModLoader.dll"), "Terraria.ID.ItemID");
var npcIdMap = LoadConstantMap(Path.Combine(tmlRoot, "tModLoader.dll"), "Terraria.ID.NPCID");

using var game = new ExportGame(repoRoot, terrariaRoot, itemIdMap, npcIdMap, jsonOptions);
game.Run();

Console.WriteLine("Terraria assets exported successfully.");

static IReadOnlyDictionary<string, int> LoadConstantMap(string assemblyPath, string fullTypeName)
{
  var assembly = AssemblyLoadContext.Default.LoadFromAssemblyPath(assemblyPath);
  var type = assembly.GetType(fullTypeName) ?? throw new InvalidOperationException($"Type not found: {fullTypeName}");
  var values = new Dictionary<string, int>(StringComparer.Ordinal);

  foreach (var field in type.GetFields(BindingFlags.Public | BindingFlags.Static))
  {
    if (field.FieldType == typeof(int))
    {
      values[field.Name] = (int)(field.GetRawConstantValue() ?? field.GetValue(null) ?? 0);
    }
  }

  if (values.Count == 0)
  {
    var searchField = type.GetField("Search", BindingFlags.Public | BindingFlags.Static);
    var search = searchField?.GetValue(null);
    var nameToIdField = search?.GetType().GetField("_nameToId", BindingFlags.NonPublic | BindingFlags.Instance);
    var nameToId = nameToIdField?.GetValue(search) as System.Collections.IDictionary;

    if (nameToId is not null)
    {
      foreach (System.Collections.DictionaryEntry entry in nameToId)
      {
        if (entry.Key is string name && entry.Value is int id)
        {
          values[name] = id;
        }
      }
    }
  }

  return values;
}

static void RegisterResolvers(string tmlRoot)
{
  var candidates = new[]
  {
    tmlRoot,
    Path.Combine(tmlRoot, "Libraries", "FNA", "1.0.0"),
    Path.Combine(tmlRoot, "Libraries", "ReLogic", "1.0.0"),
    Path.Combine(tmlRoot, "Libraries", "Steamworks.NET", "20.1.0")
  };

  AssemblyLoadContext.Default.Resolving += (_, assemblyName) =>
  {
    var fileName = $"{assemblyName.Name}.dll";

    foreach (var directory in candidates)
    {
      var candidate = Path.Combine(directory, fileName);
      if (File.Exists(candidate))
      {
        return AssemblyLoadContext.Default.LoadFromAssemblyPath(candidate);
      }
    }

    return null;
  };
}

static string FindRepoRoot()
{
  var directory = new DirectoryInfo(AppContext.BaseDirectory);

  while (directory is not null)
  {
    if (File.Exists(Path.Combine(directory.FullName, "README.md")) &&
        Directory.Exists(Path.Combine(directory.FullName, "docs")) &&
        Directory.Exists(Path.Combine(directory.FullName, "supported")))
    {
      return directory.FullName;
    }

    directory = directory.Parent;
  }

  throw new InvalidOperationException("Repo root was not detected.");
}

static void EnsurePath(string path, string description)
{
  if (!Directory.Exists(path))
  {
    throw new DirectoryNotFoundException($"{description} was not found at {path}");
  }
}

sealed class ExportGame : Game
{
  public ExportGame(
    string repoRoot,
    string terrariaRoot,
    IReadOnlyDictionary<string, int> itemIdMap,
    IReadOnlyDictionary<string, int> npcIdMap,
    JsonSerializerOptions jsonOptions)
  {
    _repoRoot = repoRoot;
    _terrariaRoot = terrariaRoot;
    _itemIdMap = itemIdMap;
    _npcIdMap = npcIdMap;
    _jsonOptions = jsonOptions;
    _graphics = new GraphicsDeviceManager(this);
    _graphics.PreferredBackBufferWidth = 8;
    _graphics.PreferredBackBufferHeight = 8;
    _graphics.SynchronizeWithVerticalRetrace = false;
    IsFixedTimeStep = false;
    InactiveSleepTime = TimeSpan.Zero;
  }

  private readonly GraphicsDeviceManager _graphics;
  private readonly string _repoRoot;
  private readonly string _terrariaRoot;
  private readonly IReadOnlyDictionary<string, int> _itemIdMap;
  private readonly IReadOnlyDictionary<string, int> _npcIdMap;
  private readonly JsonSerializerOptions _jsonOptions;

  protected override void Initialize()
  {
    Window.Title = "TerraPath Asset Dump";
    Window.AllowUserResizing = false;
    base.Initialize();
  }

  protected override void LoadContent()
  {
    using var content = new ContentManager(Services, Path.Combine(_terrariaRoot, "Content"));

    TerrariaAssetExport.DumpItems(
      content,
      _itemIdMap,
      Path.Combine(_repoRoot, "supported", "Terraria", "items.json"),
      Path.Combine(_repoRoot, "docs", "assets", "icons", "terraria", "items"),
      _jsonOptions);

    TerrariaAssetExport.DumpItems(
      content,
      _itemIdMap,
      Path.Combine(_repoRoot, "supported", "Terraria", "ores.json"),
      Path.Combine(_repoRoot, "docs", "assets", "icons", "terraria", "ores"),
      _jsonOptions,
      "ores");

    TerrariaAssetExport.DumpBosses(
      content,
      _npcIdMap,
      Path.Combine(_repoRoot, "supported", "Terraria", "bosses.json"),
      Path.Combine(_repoRoot, "docs", "assets", "icons", "terraria", "bosses"),
      _jsonOptions);

    Exit();
  }
}
