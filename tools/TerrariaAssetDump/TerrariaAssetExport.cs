using System.Drawing;
using System.Drawing.Imaging;
using System.Reflection;
using System.Runtime.Loader;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Xna.Framework.Content;
using Microsoft.Xna.Framework.Graphics;

static class TerrariaAssetExport
{
  public static IReadOnlyDictionary<string, string> LoadLocalizationMap(
    string assemblyPath,
    string resourceName,
    string sectionName)
  {
    var assembly = Assembly.LoadFrom(assemblyPath);
    using var stream = assembly.GetManifestResourceStream(resourceName)
      ?? throw new InvalidOperationException($"Resource was not found: {resourceName}");
    using var reader = new StreamReader(stream);
    using var document = JsonDocument.Parse(
      reader.ReadToEnd(),
      new JsonDocumentOptions
      {
        AllowTrailingCommas = true
      });

    if (!document.RootElement.TryGetProperty(sectionName, out var section) || section.ValueKind != JsonValueKind.Object)
    {
      throw new InvalidOperationException($"Section {sectionName} was not found in {resourceName}");
    }

    var values = new Dictionary<string, string>(StringComparer.Ordinal);
    foreach (var property in section.EnumerateObject())
    {
      values[property.Name] = property.Value.GetString() ?? string.Empty;
    }

    return values;
  }

  public static void DumpItems(
    ContentManager content,
    IReadOnlyDictionary<string, int> idMap,
    string jsonPath,
    string outputFolder,
    JsonSerializerOptions jsonOptions,
    string arrayName = "items",
    IReadOnlyDictionary<string, string>? localizedNamesRu = null)
  {
    Directory.CreateDirectory(outputFolder);
    var node = JsonNode.Parse(File.ReadAllText(jsonPath))!.AsObject();
    var items = node[arrayName]?.AsArray() ?? [];

    foreach (var itemNode in items.OfType<JsonObject>())
    {
      var internalName = itemNode["internalName"]?.GetValue<string>();
      var assetId = itemNode["assetId"]?.GetValue<int?>()
        ?? (!string.IsNullOrWhiteSpace(internalName) && idMap.TryGetValue(internalName, out var resolvedId) ? resolvedId : (int?)null);

      if (assetId is null)
      {
        continue;
      }

      if (!string.IsNullOrWhiteSpace(internalName) &&
          itemNode["displayNameRu"] is null &&
          localizedNamesRu is not null &&
          localizedNamesRu.TryGetValue(internalName, out var localizedName))
      {
        itemNode["displayNameRu"] = localizedName;
      }

      var slug = BuildSlug(itemNode["displayName"]?.GetValue<string>() ?? internalName ?? "entry");
      var relativePath = $"assets/icons/terraria/{arrayName}/{slug}.png";
      var outputPath = Path.Combine(outputFolder, $"{slug}.png");
      if (TryExportTexture(content, $"Images/Item_{assetId.Value}", outputPath))
      {
        itemNode["icon"] = relativePath.Replace("\\", "/");
      }
    }

    File.WriteAllText(jsonPath, node.ToJsonString(jsonOptions));
  }

  public static void DumpBosses(
    ContentManager content,
    IReadOnlyDictionary<string, int> idMap,
    string jsonPath,
    string outputFolder,
    JsonSerializerOptions jsonOptions,
    IReadOnlyDictionary<string, string>? localizedNamesRu = null)
  {
    Directory.CreateDirectory(outputFolder);
    var node = JsonNode.Parse(File.ReadAllText(jsonPath))!.AsObject();
    var bosses = node["bosses"]?.AsArray() ?? [];

    foreach (var bossNode in bosses.OfType<JsonObject>())
    {
      var assetPath = bossNode["assetPath"]?.GetValue<string>();
      var internalName = bossNode["internalName"]?.GetValue<string>();

      if (!string.IsNullOrWhiteSpace(internalName) &&
          bossNode["displayNameRu"] is null &&
          localizedNamesRu is not null &&
          localizedNamesRu.TryGetValue(internalName, out var localizedName))
      {
        bossNode["displayNameRu"] = localizedName;
      }

      if (string.IsNullOrWhiteSpace(assetPath))
      {
        var npcId = !string.IsNullOrWhiteSpace(internalName) && idMap.TryGetValue(internalName, out var resolvedId)
          ? resolvedId
          : (int?)null;

        if (npcId is null)
        {
          continue;
        }

        assetPath = $"Images/NPC_{npcId.Value}";
      }

      var slug = BuildSlug(bossNode["displayName"]?.GetValue<string>() ?? internalName ?? "boss");
      var relativePath = $"assets/icons/terraria/bosses/{slug}.png";
      var outputPath = Path.Combine(outputFolder, $"{slug}.png");

      if (TryExportTexture(content, assetPath, outputPath, cropBossFrame: true))
      {
        bossNode["icon"] = relativePath.Replace("\\", "/");
      }
    }

    File.WriteAllText(jsonPath, node.ToJsonString(jsonOptions));
  }

  public static void DumpSearchItems(
    ContentManager content,
    IReadOnlyDictionary<string, int> idMap,
    string assemblyPath,
    string jsonPath,
    string outputFolder,
    JsonSerializerOptions jsonOptions,
    IReadOnlyDictionary<string, string> localizedNamesEn,
    IReadOnlyDictionary<string, string> localizedNamesRu)
  {
    Directory.CreateDirectory(outputFolder);
    var categoryInspector = new ItemCategoryInspector(assemblyPath);
    var sortedItems = idMap
      .Where(pair => pair.Value > 0)
      .OrderBy(pair => pair.Value)
      .ThenBy(pair => pair.Key, StringComparer.Ordinal);

    var items = new JsonArray();

    foreach (var (internalName, assetId) in sortedItems)
    {
      var englishName = localizedNamesEn.TryGetValue(internalName, out var enName) && !string.IsNullOrWhiteSpace(enName)
        ? enName
        : internalName;
      var russianName = localizedNamesRu.TryGetValue(internalName, out var ruName) && !string.IsNullOrWhiteSpace(ruName)
        ? ruName
        : englishName;
      var slug = BuildSlug(internalName);
      var relativePath = $"assets/icons/terraria/search-items/{slug}.png";
      var outputPath = Path.Combine(outputFolder, $"{slug}.png");
      var itemNode = new JsonObject
      {
        ["id"] = $"Terraria/{internalName}",
        ["internalName"] = internalName,
        ["displayName"] = englishName,
        ["displayNameRu"] = russianName
      };

      var category = categoryInspector.Infer(assetId);
      if (!string.IsNullOrWhiteSpace(category))
      {
        itemNode["category"] = category;
      }

      if (TryExportTexture(content, $"Images/Item_{assetId}", outputPath))
      {
        itemNode["icon"] = relativePath.Replace("\\", "/");
      }

      items.Add(itemNode);
    }

    var root = new JsonObject
    {
      ["mod"] = "Terraria",
      ["contentType"] = "search-items",
      ["items"] = items
    };

    File.WriteAllText(jsonPath, root.ToJsonString(jsonOptions));
  }

  private static bool TryExportTexture(ContentManager content, string assetName, string outputPath, bool cropBossFrame = false)
  {
    try
    {
      content.Unload();
      var texture = content.Load<Texture2D>(assetName);
      var frameHeight = texture.Height;

      if (cropBossFrame && texture.Height > texture.Width * 2)
      {
        var estimatedFrames = Math.Max(1, (int)Math.Round((double)texture.Height / texture.Width));
        frameHeight = Math.Max(1, texture.Height / estimatedFrames);
      }

      var pixels = new Microsoft.Xna.Framework.Color[texture.Width * frameHeight];
      texture.GetData(0, new Microsoft.Xna.Framework.Rectangle(0, 0, texture.Width, frameHeight), pixels, 0, pixels.Length);

      using var bitmap = new Bitmap(texture.Width, frameHeight, PixelFormat.Format32bppArgb);

      for (var y = 0; y < frameHeight; y += 1)
      {
        for (var x = 0; x < texture.Width; x += 1)
        {
          var pixel = pixels[y * texture.Width + x];
          bitmap.SetPixel(x, y, Color.FromArgb(pixel.A, pixel.R, pixel.G, pixel.B));
        }
      }

      using var trimmed = TrimTransparentBounds(bitmap);
      trimmed.Save(outputPath, ImageFormat.Png);
      return true;
    }
    catch (Exception exception)
    {
      Console.WriteLine($"Failed to export {assetName}: {exception.Message}");
      return false;
    }
  }

  private static Bitmap TrimTransparentBounds(Bitmap source)
  {
    var minX = source.Width;
    var minY = source.Height;
    var maxX = -1;
    var maxY = -1;

    for (var y = 0; y < source.Height; y += 1)
    {
      for (var x = 0; x < source.Width; x += 1)
      {
        if (source.GetPixel(x, y).A <= 10)
        {
          continue;
        }

        minX = Math.Min(minX, x);
        minY = Math.Min(minY, y);
        maxX = Math.Max(maxX, x);
        maxY = Math.Max(maxY, y);
      }
    }

    if (maxX < minX || maxY < minY)
    {
      return (Bitmap)source.Clone();
    }

    var rectangle = new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1);
    return source.Clone(rectangle, PixelFormat.Format32bppArgb);
  }

  private static string BuildSlug(string value)
  {
    var chars = value
      .Trim()
      .ToLowerInvariant()
      .Select((character) => char.IsLetterOrDigit(character) ? character : '-')
      .ToArray();

    return string.Join(
      "-",
      new string(chars)
        .Split('-', StringSplitOptions.RemoveEmptyEntries));
  }

  private sealed class ItemCategoryInspector
  {
    private readonly object? _itemInstance;
    private readonly MethodInfo? _setDefaultsMethod;
    private readonly Type? _itemType;

    public ItemCategoryInspector(string assemblyPath)
    {
      try
      {
        var assembly = AssemblyLoadContext.Default.Assemblies.FirstOrDefault((candidate) =>
          string.Equals(Path.GetFullPath(candidate.Location), Path.GetFullPath(assemblyPath), StringComparison.OrdinalIgnoreCase))
          ?? AssemblyLoadContext.Default.LoadFromAssemblyPath(assemblyPath);

        _itemType = assembly.GetType("Terraria.Item");
        if (_itemType is null)
        {
          return;
        }

        _itemInstance = Activator.CreateInstance(_itemType);
        _setDefaultsMethod = _itemType
          .GetMethods(BindingFlags.Public | BindingFlags.Instance)
          .FirstOrDefault((method) =>
          {
            if (!string.Equals(method.Name, "SetDefaults", StringComparison.Ordinal)) return false;
            var parameters = method.GetParameters();
            return parameters.Length > 0 && parameters[0].ParameterType == typeof(int);
          });
      }
      catch
      {
        _itemType = null;
        _itemInstance = null;
        _setDefaultsMethod = null;
      }
    }

    public string? Infer(int itemId)
    {
      if (_itemInstance is null || _setDefaultsMethod is null)
      {
        return null;
      }

      try
      {
        var parameters = _setDefaultsMethod.GetParameters();
        var args = new object?[parameters.Length];
        args[0] = itemId;

        for (var index = 1; index < parameters.Length; index += 1)
        {
          args[index] = parameters[index].HasDefaultValue
            ? parameters[index].DefaultValue
            : (parameters[index].ParameterType.IsValueType ? Activator.CreateInstance(parameters[index].ParameterType) : null);
        }

        _setDefaultsMethod.Invoke(_itemInstance, args);

        var accessory = ReadBool("accessory");
        var headSlot = ReadInt("headSlot", -1);
        var bodySlot = ReadInt("bodySlot", -1);
        var legSlot = ReadInt("legSlot", -1);
        var ammo = ReadInt("ammo", 0);
        var buffType = ReadInt("buffType", 0);
        var healLife = ReadInt("healLife", 0);
        var healMana = ReadInt("healMana", 0);
        var damage = ReadInt("damage", 0);
        var pick = ReadInt("pick", 0);
        var axe = ReadInt("axe", 0);
        var hammer = ReadInt("hammer", 0);
        var fishingPole = ReadInt("fishingPole", 0);
        var consumable = ReadBool("consumable");
        var potion = ReadBool("potion");
        var defense = ReadInt("defense", 0);

        if (accessory)
        {
          return "accessory";
        }

        if (headSlot >= 0 || bodySlot >= 0 || legSlot >= 0 || defense > 0)
        {
          return "armor";
        }

        if (ammo > 0 || buffType > 0 || healLife > 0 || healMana > 0 || potion || consumable && (healLife > 0 || healMana > 0))
        {
          return "buff";
        }

        if (damage > 0 || pick > 0 || axe > 0 || hammer > 0 || fishingPole > 0)
        {
          return "weapon";
        }
      }
      catch
      {
        return null;
      }

      return null;
    }

    private bool ReadBool(string name)
    {
      var value = ReadMember(name);
      return value is bool boolean && boolean;
    }

    private int ReadInt(string name, int fallback)
    {
      var value = ReadMember(name);
      return value is int integer ? integer : fallback;
    }

    private object? ReadMember(string name)
    {
      if (_itemType is null || _itemInstance is null)
      {
        return null;
      }

      var field = _itemType.GetField(name, BindingFlags.Public | BindingFlags.Instance);
      if (field is not null)
      {
        return field.GetValue(_itemInstance);
      }

      var property = _itemType.GetProperty(name, BindingFlags.Public | BindingFlags.Instance);
      return property?.GetValue(_itemInstance);
    }
  }
}
