// ==============================
// Query Types
// ==============================

export type ListAccountsQuery = { email?: string };
export type SearchAccountsQuery = {
  email?: string;
  firstName?: string;
  lastName?: string;
  from?: string;
  size?: string;
};

export type SearchAnimalsQuery = {
  chipperId?: string;
  chippingLocationId?: string;
  startDateTime?: string;
  endDateTime?: string;
  from?: string;
  size?: string;
};

export type ListVisitedLocationsQuery = {
  startDateTime?: string;
  endDateTime?: string;
  from?: string;
  size?: string;
};
