# RLC直列回路の微分方程式  
$$\begin{aligned}
	\frac{di}{dt} = -\frac{1}{LC}q - \frac{R}{L}i + \frac{1}{L}V(t)
\end{aligned}$$

# クリフォード代数化  
## 基底の設定  
$$\begin{aligned}
	&e_i^2 = e_j^2 = 1 \\
	&e_ie_j = -e_je_i = I\quad\left(I^2 = -1\right)
\end{aligned}$$

## 状態の表現  
$$\begin{aligned}
	\psi(t) &= \sqrt{\frac{C}{2}}v_Ce_i + \sqrt{\frac{L}{2}}ie_j \\
	&= \frac{1}{\sqrt{2C}}qe_i + \sqrt{\frac{L}{2}}ie_j
\end{aligned}$$

## エネルギーの表現  
$$\begin{aligned}
	E &= \psi^2 \\
	&= \left(\frac{1}{\sqrt{2C}}q\right)^2e_i^2 + \frac{1}{2}\sqrt{\frac{L}{C}}qi\left(e_ie_j + e_je_i\right) + \left(\sqrt{\frac{L}{2}}i\right)^2e_j^2 \\
	&= \frac{1}{2C}q^2 + \frac{1}{2}Li^2
\end{aligned}$$

## 状態方程式  
$$\begin{aligned}
	&\omega_0 = \frac{1}{\sqrt{LC}},\alpha = \frac{R}{2L},P_j = \frac{1}{2}\left(1 + \mathrm{Ad}_{e_j}\right) \\
	&\frac{d\psi}{dt} = \left(\omega_0I - 2\alpha P_j\right)\psi + \frac{V(t)}{\sqrt{2L}}e_j\quad\left(\text{積順は左作用右状態}\right)
\end{aligned}$$
  
* **第1項(回転):** $\omega_0 I$  
	LC共振・エネルギー交換  
	$\omega_0 = \frac{1}{\sqrt{LC}}$ は固有角周波数。  
	擬スカラー $(I)$ を掛けることは状態ベクトル $(\psi)$ を90度回転させることに対応。  
	コンデンサ $(e_{i})$ とコイル $(e_{j})$ の間でエネルギーが周期的にやり取りされる様子を表す。  

* **第2項(減衰):** $-2\alpha P_j$  
	抵抗による減衰  
	$\alpha = \frac{R}{2L}$ は減衰係数。  
	 $\mathrm{Ad}_{e_j}$ は状態ベクトル $(\psi)$ を軸 $(e_j)$ に対して鏡映反転させる操作である。  
	$P_j$ は状態ベクトル $(\psi)$ の電流成分 $(e_j)$ のみを抽出する射影演算子として機能する。  
	これにより、電流 $(i)$ にのみ比例して発生する抵抗 $(R)$ でのエネルギー損失が簡潔に表現される。  

* **第3項(外力):** $\frac{V(t)}{\sqrt{2L}}e_j$  
	外部電源からの入力  
	外部電圧 $(V(t))$ によって $(e_j)$ 方向(電流変化の方向)へエネルギーが供給される外力項である。

## 指数写像  
$$\begin{aligned}
	\Omega &= \omega_0I - 2\alpha P_j \\
	&= -\alpha + \underbrace{\omega_0 I - \alpha\mathrm{Ad}_{e_j}}_{\beta}
\end{aligned}$$
$$\begin{aligned}
	\beta^2 &= \left(\omega_0 I - \alpha\mathrm{Ad}_{e_j}\right)^2 \\
	&= (\omega_0 I)^2 - \omega_0\alpha I\mathrm{Ad}_{e_j} - \alpha\omega_0\mathrm{Ad}_{e_j}I + \left(-\alpha\mathrm{Ad}_{e_j}\right)^2 \\
	&= -\omega_0^2 + \alpha^2 \\
	&= -\left(\omega_0^2 - \alpha^2\right)
\end{aligned}$$
  
* $\beta$ は二乗においてスカラーになる無限小生成元。  
* $\alpha,\beta$ は互いに可換である。  
* $\omega_0,\alpha$ の関係によって楕円型、冪零型、双曲型が決まる。  
  
$$\begin{aligned}
	M(t) = e^{\Omega t} = e^{-\alpha t}e^{\beta t}
\end{aligned}$$

## デュアメルの原理を用いた更新  
$$\begin{aligned}
	\psi(t) = M(t)\psi(0) + \int_0^t{M(t-u)\frac{V(u)}{\sqrt{2L}}e_j}du
\end{aligned}$$
