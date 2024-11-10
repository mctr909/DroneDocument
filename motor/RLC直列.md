$$\begin{align*}
	v(t)&=v_b(t)-v_a(t) \\
	i(t)&=i_b(t)-i_a(t) \\
	v(t)&=R i(t)+L\frac{di}{dt}+\frac{1}{C}\int_0^t i(t) dt
\end{align*}$$  
$$\begin{align*}
	&\text{微分項の離散化} \\
	&\frac{di}{dt}\approx\frac{i_{n}-i_{n-1}}{\Delta t}
\end{align*}$$  
$$\begin{align*}
	&\text{積分項の離散化} \\
	&\int_0^t i(x)dx=q(t)\approx q_{n-1}+i_{n}\Delta t
\end{align*}$$  
$$\begin{align*}
	v_{n}&=R i_{n}+L\frac{i_{n}-i_{n-1}}{\Delta t}+\frac{1}{C}\left(q_{n-1}+i_{n}\Delta t\right) \\
	v_{n}&=R i_{n}+\frac{L}{\Delta t}i_{n}-\frac{L}{\Delta t}i_{n-1}+\frac{1}{C}q_{n-1}+\frac{1}{C}i_{n}\Delta t \\
	\left(R+\frac{L}{\Delta t}+\frac{\Delta t}{C}\right)i_{n}&=v_{n}+\frac{L}{\Delta t}i_{n-1}-\frac{1}{C}q_{n-1} \\
	i_{n}&=\frac{v_{n}+\dfrac{L}{\Delta t}i_{n-1}-\dfrac{1}{C}q_{n-1}}{R+\dfrac{L}{\Delta t}+\dfrac{\Delta t}{C}} \\
	i_{n}&=\frac{\Delta t v_{n}+L i_{n-1}-\dfrac{\Delta t}{C}q_{n-1}}{R\Delta t+L+\dfrac{\Delta t^2}{C}} \\
	i_{n}&=\frac{C\Delta t v_{n}+CL i_{n-1}-\Delta t q_{n-1}}{CR\Delta t+CL+\Delta t^2} \\
	q_{n}&=q_{n-1}+i_{n}\Delta t
\end{align*}$$
