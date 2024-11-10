<div style="text-align:center; background-color:#ffffff; padding:0px;">
    <img src="PWM.svg"/>
</div>

> # [マイコン] エッジアライン型PWM出力
> $$
\begin{align*}
	f(x)&=1.15\left(\sin(x) + \frac{\sin(3x)}{6}\right) \\
	U_{S}&=I_n f\left(\theta_n\right) \\
	V_{S}&=I_n f\left(\theta_n+\frac{2\pi}{3}\right) \\
	W_{S}&=I_n f\left(\theta_n-\frac{2\pi}{3}\right)
\end{align*}$$  
> $$
\begin{align*}
	T_{n}&=T_{n-1}+\Delta_{C}-\text{trunc}\left(T_{n-1}+\Delta_{C}\right) \\
	C&=2T_{n}-1 \\
	U&=U_{S}\ge C \\
	V&=V_{S}\ge C \\
	W&=W_{S}\ge C
\end{align*}$$  

> # [論理回路] ゲート信号生成
> $$
\begin{align*}
	U_{+}&=V\cdot\overline{W} \\
	U_{-}&=\overline{V}\cdot W \\
	V_{+}&=W\cdot\overline{U} \\
	V_{-}&=\overline{W}\cdot U \\
	W_{+}&=U\cdot\overline{V} \\
	W_{-}&=\overline{U}\cdot V
\end{align*}$$  
> 
> 例として、相($U$)であれば他の2相($V,W$)の状態を用いて以下のとおりゲート信号($U_{+},U_{-}$)を生成します。  
> |V|W|U+|U-|
> |-|-|-|-|
> |0|0|0|0|
> |0|1|0|1|
> |1|0|1|0|
> |1|1|0|0|
> 
> この通り、相($U$)においてゲート信号($U_{+},U_{-}$)が同時にONすることを回避できます。

> # [論理回路] サンプリング同期信号生成
> $$
\begin{align*}
	S_U&=V \oplus \overline{W} \\
	S_V&=W \oplus \overline{U} \\
	S_W&=U \oplus \overline{V}
\end{align*}$$  
> 
> ($S_U=V \oplus \overline{W}$)の意味:  
> これは2つの状態($V, W$)が一致している(共にON、または共にOFF)期間にアクティブになります。  
> エッジアラインPWMでは、($U,V,W$)の立ち上がりタイミングがキャリアの開始点(エッジ)で揃うため、  
> PWMキャリア周波数によらず($U,V,W$)の状態よって自律的に決定されます。  

> # [マイコン] 直交座標変換
> $$
\begin{align*}
	b&=\frac{I_U+2I_V}{\sqrt{3}} \\
	F_c&=1-\exp{\left(-\dfrac{2\pi f_c}{f_s}\right)} \\
	\alpha_n&=\alpha_{n-1}+F_c\left(I_U-\alpha_{n-1}\right) \\
	\beta_n&=\beta_{n-1}+F_c\left(b-\beta_{n-1}\right)
\end{align*}$$  
> |文字|名称|値の属性|
> |-|-|-|
> |($b$)|クラーク変換値|ローカル変数|
> |($F_c$)|フィルタ係数|設定値|
> |($\alpha,\beta$)|フィルタ状態変数|グローバル変数|
> 
> サンプル＆ホールド回路によって0相成分によるオフセットをあらかじめ補正しておくことにより、  
> ($I_U,I_V$)のみで直交座標変換を実現している。

> # [マイコン] 位相更新
> $$
\begin{align*}
	\psi&=\text{atan2}(\beta_{n},\alpha_{n})-\theta_{n-1} \\
	x_{e}&=\cos(\phi)-\cos(\psi) \\
	y_{e}&=\sin(\phi)-\sin(\psi) \\
	\phi_{F}&=1-\exp{\left(-\dfrac{2\pi f_{\phi}}{f_{s}}\right)} \\
	x_{f_{n}}&=x_{f_{n-1}}+\phi_{F}x_{e} \\
	y_{f_{n}}&=y_{f_{n-1}}+\phi_{F}y_{e} \\
	x&=K_{p}x_{e}+K_{i}x_{f_n} \\
	y&=K_{p}y_{e}+K_{i}y_{f_n} \\
	\Delta_{\theta}&=\text{atan2}(y,x) \\
	\theta_{n}&=\theta_{n-1}+\Delta_{\theta} \\
	\omega_{F}&=1-\exp{\left(-\dfrac{2\pi f_{\omega}}{f_{s}}\right)} \\
	\omega_{n}&=\omega_{n-1}+\omega_{F}\left(f_{s}\Delta_{\theta}-\omega_{n-1}\right)
\end{align*}$$  
> |文字|名称|値の属性|
> |-|-|-|
> |($\phi$)|目標位相差|モデルを参照($-\dfrac{\pi}{2}\le\phi\le\dfrac{\pi}{2}$)|
> |($\psi$)|観測位相差|ローカル変数|
> |($x_{e},y_{e}$)|単位円上の位相誤差|ローカル変数|
> |($\phi_{F}$)|位相フィルタ係数|設定値|
> |($x_{f},y_{f}$)|位相フィルタ状態変数|グローバル変数|
> |($K_{p},K_{i}$)|位相PI制御ゲイン|設定値|
> |($x,y$)|位相PI制御状態|ローカル変数|
> |($\Delta_{\theta}$)|位相増分|ローカル変数|
> |($\theta$)|位相|グローバル変数、モデルが参照|
> |($\omega_{F}$)|角速度フィルタ係数|設定値|
> |($\omega$)|角速度フィルタ状態変数|グローバル変数、モデルが参照|

> # [マイコン] 電流更新
> $$
\begin{align*}
	I_{e}&=I_{t}-I_{n-1} \\
	I_{F}&=1-\exp{\left(-\dfrac{2\pi f_{i}}{f_{s}}\right)} \\
	I_{f_n}&=I_{f_{n-1}}+I_{F}\left(I_{e}-I_{f_{n-1}}\right) \\
	I_{n}&=L_{p}I_{e}+L_{i}I_{f_n}
\end{align*}$$  
> |文字|名称|値の属性|
> |-|-|-|
> |($I_{t}$)|電流目標値|モデルを参照($0\le I_{t}\le\dfrac{f_{s}}{32}$)|
> |($I_{e}$)|電流誤差|ローカル変数|
> |($I_{F}$)|電流フィルタ係数|設定値|
> |($I_{f}$)|電流フィルタ状態変数|グローバル変数|
> |($L_{p},L_{i}$)|電流PI制御ゲイン|設定値|
> |($I$)|電流PI制御状態変数|グローバル変数|
