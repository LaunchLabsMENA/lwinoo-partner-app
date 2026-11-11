import type { Account, SetupStep } from '../api/types';
import type { RootStackParamList } from './types';

export const SETUP_ROUTES = [
  'SetupPartner',
  'SetupProfile',
  'SetupSchedule',
  'SetupArea',
  'SetupServices',
  'SetupDocuments',
  'SetupPayout',
] as const;

const STEP_ROUTE: Record<SetupStep, number> = {
  PROFILE: 1,
  SCHEDULE: 2,
  SERVICE_AREA: 3,
  SERVICES: 4,
  DOCUMENTS: 5,
  PAYOUT: 6,
  SUBMITTED: 6,
};

export type Route = { name: keyof RootStackParamList };

/** The setup screens up to `step`, so Back still walks through the earlier steps. */
export const setupRoutes = (step: SetupStep | null | undefined): Route[] =>
  SETUP_ROUTES.slice(0, (step ? STEP_ROUTE[step] : 0) + 1).map(name => ({ name }));

/** Where the server says this account belongs. */
export const routesFor = (account: Pick<Account, 'nextAction' | 'business'>): Route[] => {
  switch (account.nextAction) {
    case 'BUSINESS_PORTAL':
      return [{ name: 'Main' }];
    case 'VERIFICATION_STATUS':
      return [{ name: 'UnderReview' }];
    default:
      return account.business?.setupStep === 'SUBMITTED'
        ? [{ name: 'UnderReview' }]
        : setupRoutes(account.business?.setupStep);
  }
};

export const resetTo = (routes: Route[]) => ({ index: routes.length - 1, routes });
