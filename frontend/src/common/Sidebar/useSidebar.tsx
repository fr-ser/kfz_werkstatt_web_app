import React, { createContext, useContext, useState } from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import { SidebarBigScreen } from "common/MediaQueries";

interface SidebarState {
  drawerWidth: number;
  variant: "temporary" | "permanent";
  isOpen: boolean;
}

type ContextInterface = [SidebarState, (state: SidebarState) => void];

export const sidebarContext = createContext<ContextInterface>([
  {
    drawerWidth: 250,
    variant: "temporary",
    isOpen: false,
  },
  _ => {},
]);

export function useSidebar() {
  const [state, setState] = useContext(sidebarContext);

  function toggleSidebar(open?: boolean | React.MouseEvent) {
    // also accept an event to be able to pass this directly to an
    // event handler

    if (typeof open === "boolean") {
      setState({ ...state, isOpen: open });
    } else {
      setState({ ...state, isOpen: !state.isOpen });
    }
  }

  return {
    drawerWidth: state.drawerWidth,
    variant: state.variant,
    isOpen: state.isOpen,
    toggleSidebar,
  };
}

export function SidebarProvider(props: React.Props<{}>) {
  const bigScreeen = useMediaQuery(SidebarBigScreen);
  const initialState: SidebarState = {
    drawerWidth: 250,
    variant: bigScreeen ? "permanent" : "temporary",
    isOpen: bigScreeen,
  };
  const [state, setState] = useState(initialState);

  if (bigScreeen && state.variant === "temporary") {
    setState({ ...state, variant: "permanent" });
  } else if (!bigScreeen && state.variant === "permanent") {
    setState({ ...state, variant: "temporary" });
  }

  return (
    <sidebarContext.Provider value={[state, setState]}>{props.children}</sidebarContext.Provider>
  );
}
