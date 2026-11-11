import { http } from './client';
import type { Category, PartnerType } from './types';

export const fetchPartnerTypes = async () =>
  (await http.get<PartnerType[]>('/api/partner-types')).data;

export const fetchCategories = async () => (await http.get<Category[]>('/api/categories')).data;
