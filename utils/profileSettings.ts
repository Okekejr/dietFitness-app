import { ProfileConfig } from "@/types";

export const profileSetting: ProfileConfig = [
  {
    key: "Edit Experience",
    name: "Edit Experience",
    leftIcon: "pulse-outline",
    rightIcon: "chevron-forward",
    hrefLink: "/editProfile",
  },
  {
    key: "Notifications",
    name: "Notifications",
    leftIcon: "notifications-outline",
    rightIcon: "chevron-forward",
    hrefLink: "/notificationSettings",
  },
  {
    key: "Subscription & Billing",
    name: "Subscription & Billing",
    leftIcon: "card-outline",
    rightIcon: "chevron-forward",
    hrefLink: "/subscription",
  },
  {
    key: "Help and Info",
    name: "Help & Info",
    leftIcon: "information-circle-outline",
    rightIcon: "chevron-forward",
    hrefLink: "/helpScreen",
  },
  {
    key: "Settings",
    name: "Settings",
    leftIcon: "settings-outline",
    rightIcon: "chevron-forward",
    content: "settings",
  },
];

export const HelpScreenSettings: ProfileConfig = [
  {
    key: "Terms and Conditions",
    name: "Terms and Conditions",
    leftIcon: "document-text-outline",
    rightIcon: "chevron-forward",
    hrefLink: "",
  },
  {
    key: "Privacy Policy",
    name: "Privacy Policy",
    leftIcon: "document-text-outline",
    rightIcon: "chevron-forward",
    hrefLink: "",
  },
  {
    key: "Frequently Asked Questions",
    name: "Frequently Asked Questions",
    leftIcon: "help-circle-outline",
    rightIcon: "chevron-forward",
    hrefLink: "",
  },
  {
    key: "Send feedback",
    name: "Send feedback",
    leftIcon: "mail-outline",
    rightIcon: "chevron-forward",
    hrefLink: "",
  },
];
