
namespace Motor
{
	partial class Form1
	{
		/// <summary>
		/// 必要なデザイナー変数です。
		/// </summary>
		private System.ComponentModel.IContainer components = null;

		/// <summary>
		/// 使用中のリソースをすべてクリーンアップします。
		/// </summary>
		/// <param name="disposing">マネージド リソースを破棄する場合は true を指定し、その他の場合は false を指定します。</param>
		protected override void Dispose(bool disposing)
		{
			if (disposing && (components != null))
			{
				components.Dispose();
			}
			base.Dispose(disposing);
		}

		#region Windows フォーム デザイナーで生成されたコード

		/// <summary>
		/// デザイナー サポートに必要なメソッドです。このメソッドの内容を
		/// コード エディターで変更しないでください。
		/// </summary>
		private void InitializeComponent()
		{
			System.Windows.Forms.DataVisualization.Charting.ChartArea chartArea1 = new System.Windows.Forms.DataVisualization.Charting.ChartArea();
			System.Windows.Forms.DataVisualization.Charting.Legend legend1 = new System.Windows.Forms.DataVisualization.Charting.Legend();
			System.Windows.Forms.DataVisualization.Charting.ChartArea chartArea2 = new System.Windows.Forms.DataVisualization.Charting.ChartArea();
			System.Windows.Forms.DataVisualization.Charting.Legend legend2 = new System.Windows.Forms.DataVisualization.Charting.Legend();
			System.Windows.Forms.DataVisualization.Charting.ChartArea chartArea3 = new System.Windows.Forms.DataVisualization.Charting.ChartArea();
			System.Windows.Forms.DataVisualization.Charting.Legend legend3 = new System.Windows.Forms.DataVisualization.Charting.Legend();
			this.chartI = new System.Windows.Forms.DataVisualization.Charting.Chart();
			this.chartRotor = new System.Windows.Forms.DataVisualization.Charting.Chart();
			this.chartFreq = new System.Windows.Forms.DataVisualization.Charting.Chart();
			((System.ComponentModel.ISupportInitialize)(this.chartI)).BeginInit();
			((System.ComponentModel.ISupportInitialize)(this.chartRotor)).BeginInit();
			((System.ComponentModel.ISupportInitialize)(this.chartFreq)).BeginInit();
			this.SuspendLayout();
			// 
			// chartI
			// 
			this.chartI.BackColor = System.Drawing.Color.Black;
			chartArea1.AxisX.LineColor = System.Drawing.Color.LightGray;
			chartArea1.AxisX.MajorGrid.LineColor = System.Drawing.Color.Gray;
			chartArea1.AxisX.MinorGrid.LineColor = System.Drawing.Color.DimGray;
			chartArea1.AxisX.TitleForeColor = System.Drawing.Color.LightGray;
			chartArea1.AxisX2.LineColor = System.Drawing.Color.Gray;
			chartArea1.AxisY.LineColor = System.Drawing.Color.LightGray;
			chartArea1.AxisY.MajorGrid.LineColor = System.Drawing.Color.Gray;
			chartArea1.AxisY.MinorGrid.LineColor = System.Drawing.Color.DimGray;
			chartArea1.AxisY.TitleForeColor = System.Drawing.Color.Gray;
			chartArea1.AxisY2.LineColor = System.Drawing.Color.Gray;
			chartArea1.BackColor = System.Drawing.Color.Black;
			chartArea1.BorderColor = System.Drawing.Color.LightGray;
			chartArea1.Name = "ChartArea1";
			this.chartI.ChartAreas.Add(chartArea1);
			legend1.BackColor = System.Drawing.Color.Black;
			legend1.ForeColor = System.Drawing.Color.LightGray;
			legend1.Name = "Legend1";
			legend1.TitleBackColor = System.Drawing.Color.Black;
			this.chartI.Legends.Add(legend1);
			this.chartI.Location = new System.Drawing.Point(12, 12);
			this.chartI.Name = "chartI";
			this.chartI.Size = new System.Drawing.Size(908, 58);
			this.chartI.TabIndex = 0;
			this.chartI.Text = "chart1";
			// 
			// chartRotor
			// 
			this.chartRotor.BackColor = System.Drawing.Color.Black;
			chartArea2.AxisX.LineColor = System.Drawing.Color.LightGray;
			chartArea2.AxisX2.LineColor = System.Drawing.Color.Gray;
			chartArea2.AxisY.LineColor = System.Drawing.Color.LightGray;
			chartArea2.AxisY2.LineColor = System.Drawing.Color.Gray;
			chartArea2.BackColor = System.Drawing.Color.Black;
			chartArea2.BorderColor = System.Drawing.Color.LightGray;
			chartArea2.Name = "ChartArea1";
			this.chartRotor.ChartAreas.Add(chartArea2);
			legend2.BackColor = System.Drawing.Color.Black;
			legend2.ForeColor = System.Drawing.Color.LightGray;
			legend2.Name = "Legend1";
			this.chartRotor.Legends.Add(legend2);
			this.chartRotor.Location = new System.Drawing.Point(12, 140);
			this.chartRotor.Name = "chartRotor";
			this.chartRotor.Size = new System.Drawing.Size(908, 63);
			this.chartRotor.TabIndex = 1;
			this.chartRotor.Text = "chart1";
			// 
			// chartFreq
			// 
			this.chartFreq.BackColor = System.Drawing.Color.Black;
			chartArea3.AxisX.LineColor = System.Drawing.Color.LightGray;
			chartArea3.AxisX2.LineColor = System.Drawing.Color.Gray;
			chartArea3.AxisY.LineColor = System.Drawing.Color.LightGray;
			chartArea3.AxisY2.LineColor = System.Drawing.Color.Gray;
			chartArea3.BackColor = System.Drawing.Color.Black;
			chartArea3.BorderColor = System.Drawing.Color.LightGray;
			chartArea3.Name = "ChartArea1";
			this.chartFreq.ChartAreas.Add(chartArea3);
			legend3.BackColor = System.Drawing.Color.Black;
			legend3.ForeColor = System.Drawing.Color.LightGray;
			legend3.Name = "Legend1";
			this.chartFreq.Legends.Add(legend3);
			this.chartFreq.Location = new System.Drawing.Point(12, 209);
			this.chartFreq.Name = "chartFreq";
			this.chartFreq.Size = new System.Drawing.Size(908, 58);
			this.chartFreq.TabIndex = 2;
			this.chartFreq.Text = "chart1";
			// 
			// Form1
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size(1008, 681);
			this.Controls.Add(this.chartFreq);
			this.Controls.Add(this.chartRotor);
			this.Controls.Add(this.chartI);
			this.Name = "Form1";
			this.Text = "Form1";
			this.Load += new System.EventHandler(this.Form1_Load);
			this.SizeChanged += new System.EventHandler(this.Form1_SizeChanged);
			((System.ComponentModel.ISupportInitialize)(this.chartI)).EndInit();
			((System.ComponentModel.ISupportInitialize)(this.chartRotor)).EndInit();
			((System.ComponentModel.ISupportInitialize)(this.chartFreq)).EndInit();
			this.ResumeLayout(false);

		}

		#endregion

		private System.Windows.Forms.DataVisualization.Charting.Chart chartI;
		private System.Windows.Forms.DataVisualization.Charting.Chart chartRotor;
		private System.Windows.Forms.DataVisualization.Charting.Chart chartFreq;
	}
}

