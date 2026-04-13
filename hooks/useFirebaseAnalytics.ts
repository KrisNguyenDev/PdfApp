// File: hooks/useFirebaseAnalytics.ts
// Ví dụ sử dụng Firebase Analytics

import analytics from "@react-native-firebase/analytics";

export const useFirebaseAnalytics = () => {
  // Track screen view
  const logScreenView = async (screenName: string) => {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  };

  // Track custom events
  const logEvent = async (
    eventName: string,
    params?: { [key: string]: any },
  ) => {
    await analytics().logEvent(eventName, params);
  };

  // Track button clicks
  const logButtonClick = async (buttonName: string) => {
    await analytics().logEvent("button_click", {
      button_name: buttonName,
    });
  };

  // Track PDF actions
  const logPdfAction = async (
    action: "create" | "view" | "share" | "delete",
    pdfName?: string,
  ) => {
    await analytics().logEvent("pdf_action", {
      action_type: action,
      pdf_name: pdfName,
    });
  };

  return {
    logScreenView,
    logEvent,
    logButtonClick,
    logPdfAction,
  };
};
