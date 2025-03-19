/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as Joi from 'joi';

export const createItemSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
  }),
};

export const updateItemSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    price: Joi.number(),
  }).min(1),
};
export const getItemSchema = {
  query: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    price: Joi.number(),
  }),
};
export const getItemByIdSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};
export const deleteItemSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};
