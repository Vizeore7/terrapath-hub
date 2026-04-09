using System.Drawing;
using System.Drawing.Imaging;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Xna.Framework.Content;
using Microsoft.Xna.Framework.Graphics;

static class TerrariaAssetExport
{
  public static void DumpItems(
    ContentManager content,
    IReadOnlyDictionary<string, int> idMap,
    string jsonPath,
    string outputFolder,
    JsonSerializerOptions jsonOptions,
    string arrayName = "items")
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

      var slug = BuildSlug(itemNode["displayName"]?.GetValue<string>() ?? internalName ?? "entry");
      var relativePath = $"assets/icons/terraria/{arrayName}/{slug}.png";
      var outputPath = Path.Combine(outputFolder, $"{slug}.png");
      ExportTexture(content, $"Images/Item_{assetId.Value}", outputPath);
      itemNode["icon"] = relativePath.Replace("\\", "/");
    }

    File.WriteAllText(jsonPath, node.ToJsonString(jsonOptions));
  }

  public static void DumpBosses(
    ContentManager content,
    IReadOnlyDictionary<string, int> idMap,
    string jsonPath,
    string outputFolder,
    JsonSerializerOptions jsonOptions)
  {
    Directory.CreateDirectory(outputFolder);
    var node = JsonNode.Parse(File.ReadAllText(jsonPath))!.AsObject();
    var bosses = node["bosses"]?.AsArray() ?? [];

    foreach (var bossNode in bosses.OfType<JsonObject>())
    {
      var assetPath = bossNode["assetPath"]?.GetValue<string>();
      var internalName = bossNode["internalName"]?.GetValue<string>();
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

      ExportTexture(content, assetPath, outputPath);

      bossNode["icon"] = relativePath.Replace("\\", "/");
    }

    File.WriteAllText(jsonPath, node.ToJsonString(jsonOptions));
  }

  private static void ExportTexture(ContentManager content, string assetName, string outputPath)
  {
    content.Unload();
    var texture = content.Load<Texture2D>(assetName);
    var pixels = new Microsoft.Xna.Framework.Color[texture.Width * texture.Height];
    texture.GetData(pixels);

    using var bitmap = new Bitmap(texture.Width, texture.Height, PixelFormat.Format32bppArgb);

    for (var y = 0; y < texture.Height; y += 1)
    {
      for (var x = 0; x < texture.Width; x += 1)
      {
        var pixel = pixels[y * texture.Width + x];
        bitmap.SetPixel(x, y, Color.FromArgb(pixel.A, pixel.R, pixel.G, pixel.B));
      }
    }

    bitmap.Save(outputPath, ImageFormat.Png);
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
}
