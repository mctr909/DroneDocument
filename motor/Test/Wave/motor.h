#ifndef __MOTOR_H__
#define __MOTOR_H__

#define ENABLE_MOTOR_MODEL

class Motor {
public:
#ifdef ENABLE_MOTOR_MODEL
	float J;
	float D;
	float K_t;
	float theta_r;
	float omega_r;
#endif
	float f_target;
	float theta_s;
	float omega_s;
	float i_stator;

private:
	float r_fk;
	float r_x, r_y;
	float omega_fk;
	float i_fk;
	float i_i;
	float i_sensor;

public:
	void init();
	void step(float sensor_x, float sensor_y);
};
#endif __MOTOR_H__
