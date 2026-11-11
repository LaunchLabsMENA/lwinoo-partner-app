import type { PartnerMe } from '../api/types';

export type SessionRoute = 'SetupPartner' | 'UnderReview' | 'Main';

export const routeFor = (me: PartnerMe): SessionRoute => {
  switch (me.status) {
    case 'DRAFT':
    case 'CHANGES_REQUESTED':
      return 'SetupPartner';
    case 'APPROVED':
    case 'ACTIVE':
      return 'Main';
    default:
      return 'UnderReview';
  }
};
