import { accountHandlers } from "./account";
import { adminContentHandlers } from "./admin-content";
import { adminOpsHandlers } from "./admin-ops";
import { authHandlers } from "./auth";
import { bookingHandlers } from "./booking";
import { catalogHandlers } from "./catalog";
import { checkoutHandlers } from "./checkout";

export const handlers = [
  ...catalogHandlers,
  ...authHandlers,
  ...bookingHandlers,
  ...checkoutHandlers,
  ...accountHandlers,
  ...adminContentHandlers,
  ...adminOpsHandlers,
];
