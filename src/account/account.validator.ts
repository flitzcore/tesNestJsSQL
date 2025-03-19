import * as Joi from 'joi';

export const createAccountSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

export const updateAccountSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    isActive: Joi.boolean(),
  }).min(1),
};

export const getAccountSchema = {
  query: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    isActive: Joi.boolean(),
  }),
};

export const getAccountByIdSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const deleteAccountSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};
