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

      if (TryExportTexture(content, assetPath, outputPath, cropBossFrame: true))
      {
        bossNode["icon"] = relativePath.Replace("\\", "/");
      }
    }

    File.WriteAllText(jsonPath, node.ToJsonString(jsonOptions));
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
}
