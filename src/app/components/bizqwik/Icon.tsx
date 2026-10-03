import type { SVGProps } from "react";
import { HomeSmileIcon } from "@solar-icons/react/linear/home-smile";
import { CalendarIcon } from "@solar-icons/react/linear/calendar";
import { UserCircleIcon } from "@solar-icons/react/linear/user-circle";
import { QrCodeIcon } from "@solar-icons/react/linear/qr-code";
import { TicketIcon } from "@solar-icons/react/linear/ticket";
import { HomeSmileIcon as HomeSmileIconBold } from "@solar-icons/react/bold-duotone/home-smile";
import { CalendarIcon as CalendarIconBold } from "@solar-icons/react/bold-duotone/calendar";
import { UserCircleIcon as UserCircleIconBold } from "@solar-icons/react/bold-duotone/user-circle";
import { TicketIcon as TicketIconBold } from "@solar-icons/react/bold-duotone/ticket";

// Same icon set (Solar) and linear/bold-duotone pairing as the business app's
// Icon.tsx — a member switching between the two apps sees one visual
// language, not two different icon styles.
export type IconName = "home" | "calendar" | "ticket" | "account" | "qr-code";

const LINEAR = {
  home: HomeSmileIcon,
  calendar: CalendarIcon,
  ticket: TicketIcon,
  account: UserCircleIcon,
  "qr-code": QrCodeIcon,
} satisfies Record<IconName, typeof HomeSmileIcon>;

// qr-code is only ever shown linear (the PT code button), so it has no bold set.
const BOLD = {
  home: HomeSmileIconBold,
  calendar: CalendarIconBold,
  ticket: TicketIconBold,
  account: UserCircleIconBold,
} satisfies Record<Exclude<IconName, "qr-code">, typeof HomeSmileIconBold>;

export function Icon({
  name,
  size = 22,
  strokeWidth = 1.9,
  solid = false,
  ...rest
}: { name: IconName; size?: number; solid?: boolean } & SVGProps<SVGSVGElement>) {
  if (solid && name !== "qr-code") {
    const Glyph = BOLD[name];
    return <Glyph size={size} {...rest} />;
  }
  const Glyph = LINEAR[name];
  return <Glyph size={size} strokeWidth={strokeWidth} {...rest} />;
}
