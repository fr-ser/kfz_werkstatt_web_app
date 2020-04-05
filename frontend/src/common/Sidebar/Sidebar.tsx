import React from "react";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import { Drawer, Button, Divider } from "@material-ui/core";
import { ChevronLeft } from "@material-ui/icons";

import { useSidebar } from "common/Sidebar";

interface StyleArgs {
  theme: Theme;
  drawerWidth: number;
}
const useStyles = makeStyles({
  drawer: {
    width: ({ drawerWidth }: StyleArgs) => `${drawerWidth}px`,
  },
  drawerPaper: {
    width: ({ drawerWidth }) => `${drawerWidth}px`,
  },
  drawerHeader: ({ theme }) => ({
    display: "flex",
    padding: theme.spacing(0, 1),
    alignItems: "center",
    cursor: "pointer",
    ...theme.typography.button,
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    "& span": {
      fontSize: "2em",
      textAlign: "center",
      flexGrow: 1,
    },
  }),
  actions: {
    display: "flex",
    flexDirection: "column",
    padding: ({ theme }) => theme.spacing(2),
  },
  mainActions: {
    flexGrow: 1,
  },
  bottomActions: {
    paddingBottom: ({ theme }) => theme.spacing(5),
  },
});

export function Sidebar() {
  const theme = useTheme();
  const { drawerWidth, variant, isOpen, toggleSidebar, mainActions } = useSidebar();
  const classes = useStyles({ theme, drawerWidth });

  function closeSidebar() {
    if (variant === "temporary") {
      toggleSidebar(false);
    }
  }

  return (
    <Drawer
      anchor="left"
      role="sidebar"
      variant={variant}
      open={isOpen}
      onClose={closeSidebar}
      className={classes.drawer}
      classes={{ paper: classes.drawerPaper }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      <div className={classes.drawerHeader} onClick={closeSidebar}>
        {variant === "permanent" ? null : <ChevronLeft fontSize="large" />}
        <span>Menü</span>
      </div>
      <Divider />
      <div className={`${classes.actions} ${classes.mainActions}`}>{mainActions}</div>
      <Divider />
      <div className={`${classes.actions} ${classes.bottomActions}`}>
        <Button variant="contained">Einstellung</Button>
      </div>
    </Drawer>
  );
}
