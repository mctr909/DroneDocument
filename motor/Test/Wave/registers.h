#ifndef __REGISTERS_H__
#define __REGISTERS_H__
#include <stdint.h>

uint8_t WREG;

/*** phase.h ***/
uint8_t u_del, u_adv;
uint8_t v_del, v_adv;
uint8_t w_del, w_adv;
uint8_t wave_u, wave_v, wave_w;
uint8_t div16x3;
uint8_t uwp, uwn;
uint8_t vup, vun;
uint8_t wvp, wvn;
uint8_t unp, unn;
uint8_t vnp, vnn;
uint8_t wnp, wnn;
int8_t theta_r;

/*** wave24.h ***/

/*** motor24.h ***/
int8_t phi;
int8_t psi;
int8_t d_theta;
int8_t theta_s;
int8_t omega_s;

float theta_model;
float omega_model;

#endif __REGISTERS_H__
