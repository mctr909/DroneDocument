$$\begin{align*}
	&\frac{d^2i(t)}{dt^2}+\left(\frac{1}{R_1C_1}+\frac{1}{R_2C_2}+\frac{1}{R_2C_1}\right)\frac{di(t)}{dt}+\left(\frac{1}{R_1R_2C_1C_2}\right)i(t)=\frac{1}{R_1}\frac{d^2v(t)}{dt^2} \\
	&\tau_1=R_1C_1 \\
	&\tau_2=R_2C_2 \\
	&\tau_3=R_2C_1 \\
	&A=\frac{1}{\tau_1}+\frac{1}{\tau_2}+\frac{1}{\tau_3} \\
	&B=\frac{1}{\tau_1\tau_2}\\
	&\frac{d^2i(t)}{dt^2}+A\frac{di(t)}{dt}+Bi(t)=\frac{1}{R_1}\frac{d^2v(t)}{dt^2}
\end{align*}$$  
$$\begin{align*}
	&\text{1階微分項の離散化} \\
	&\frac{df}{dt}\approx\frac{f_{n}-f_{n-1}}{\Delta t} \\
	&\text{2階微分項の離散化} \\
	&\frac{d^2f}{dt^2}\approx\frac{f_{n}-2f_{n-1}+f_{n-2}}{\Delta t^2}
\end{align*}$$  
$$\begin{align*}
	\frac{i_{n}-2i_{n-1}+i_{n-2}}{\Delta t^2}+A\frac{i_{n}-i_{n-1}}{\Delta t}+Bi_{n}=\frac{1}{R_1}\frac{v_{n}-2v_{n-1}+v_{n-2}}{\Delta t^2}
\end{align*}$$  
$$\begin{align*}
	i_{n}-2i_{n-1}+i_{n-2}+\Delta t A\left(i_{n}-i_{n-1}\right)+\Delta t^2 Bi_{n}=\frac{1}{R_1}\left(v_{n}-2v_{n-1}+v_{n-2}\right)
\end{align*}$$  
$$\begin{align*}
	i_{n}-2i_{n-1}+i_{n-2}+\Delta t A i_{n}-\Delta t A i_{n-1}+\Delta t^2 Bi_{n}=\frac{1}{R_1}\left(v_{n}-2v_{n-1}+v_{n-2}\right)
\end{align*}$$  
$$\begin{align*}
	\left(1+\Delta t A+\Delta t^2 B\right)i_{n}-\left(2+\Delta t A\right)i_{n-1}+i_{n-2}=\frac{1}{R_1}\left(v_{n}-2v_{n-1}+v_{n-2}\right)
\end{align*}$$  
$$\begin{align*}
	\left(1+\Delta t A+\Delta t^2 B\right)i_{n}=\left(2+\Delta t A\right)i_{n-1}-i_{n-2}+\frac{1}{R_1}\left(v_{n}-2v_{n-1}+v_{n-2}\right)
\end{align*}$$  
$$\begin{align*}
	i_{n}=\frac{1}{1+\Delta t A+\Delta t^2 B}\left(\left(2+\Delta t A\right)i_{n-1}-i_{n-2}+\frac{1}{R_1}\left(v_{n}-2v_{n-1}+v_{n-2}\right)\right)
\end{align*}$$  