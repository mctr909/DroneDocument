using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Text;

namespace Graph {
	internal class Svg {
		public enum Type {
			Line,
			Surf
		}

		public class Obj {
			public Type Type = Type.Line;
			public string Color = "black";
			public List<PointF> Points = new List<PointF>();
		}

		public static void Save(string fileName, int width, int height, params Obj[] objs) {
			var sb = new StringBuilder();
			sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>");
			sb.AppendLine("<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">");
			sb.Append($"<svg width=\"{width}\" height=\"{height}\" viewBox=\"0 0 {width} {height}\"");
			sb.Append(" version=\"1.1\"");
			sb.Append(" xmlns=\"http://www.w3.org/2000/svg\"");
			sb.Append(" xmlns:xlink=\"http://www.w3.org/1999/xlink\"");
			sb.Append(" xmlns:serif=\"http://www.serif.com/\"");
			sb.AppendLine(" xml:space=\"preserve\">");
			int lineCount = 1;
			int surfCount = 1;
			foreach (var obj in objs) {
				switch (obj.Type) {
				case Type.Line:
					sb.Append("\t<polyline points=\"");
					break;
				case Type.Surf:
					sb.Append("\t<polygon points=\"");
					break;
				}
				foreach (var p in obj.Points) {
					sb.Append($"{p.X},{height - p.Y} ");
				}
				switch (obj.Type) {
				case Type.Line:
					sb.AppendLine($"\" fill=\"none\" stroke=\"{obj.Color}\" id=\"line{lineCount}\"/>");
					lineCount++;
					break;
				case Type.Surf:
					sb.AppendLine($"\" style=\"fill:{obj.Color}; fill-rule:nonzero; stroke-width:1.0\" id=\"surf{surfCount}\"/>");
					surfCount++;
					break;
				}
			}
			sb.AppendLine("</svg>");
			using (var sw = new StreamWriter(fileName)) {
				sw.Write(sb.ToString());
			}
		}
	}
}
