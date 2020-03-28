import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import {
  AppBar,
  Tabs,
  Tab,
  Toolbar,
  IconButton,
  Typography,
  Button,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuList,
  MenuItem,
} from "@material-ui/core";
import { Menu, ExpandMore } from "@material-ui/icons";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import { NavRoute, routeNames } from "common/Navigation";
import { useSidebar } from "common/Sidebar";
import { AppHeaderSmallScreen } from "common/MediaQueries";

const useTabStyles = makeStyles({
  tab: {
    opacity: 1,
    minWidth: "unset",
  },
  phoneTab: {
    textTransform: "capitalize",
  },
});

interface NavProps {
  currentPage: NavRoute;
  pages: NavRoute[];
}

function PhoneNav({ currentPage, pages }: NavProps) {
  const classes = useTabStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const toggleOpen = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };
  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        ref={anchorRef}
        endIcon={<ExpandMore />}
        onClick={toggleOpen}
      >
        Navigation: {routeNames[currentPage]}
      </Button>
      <Popper open={open} anchorEl={anchorRef.current} role="navigation" transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === "bottom" ? "center top" : "center bottom" }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  {pages
                    .filter(route => route !== currentPage)
                    .map(route => (
                      <MenuItem
                        className={classes.phoneTab}
                        key={route}
                        onClick={handleClose}
                        component={Link}
                        to={route}
                      >
                        {routeNames[route]}
                      </MenuItem>
                    ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

function MonitorNav({ currentPage, pages }: NavProps) {
  const classes = useTabStyles();

  return (
    <Tabs value={currentPage}>
      {pages.map(route => (
        <Tab
          className={classes.tab}
          key={route}
          component={Link}
          to={route}
          label={routeNames[route]}
          value={route}
        />
      ))}
    </Tabs>
  );
}

interface StyleArgs {
  theme: Theme;
  drawerWidth: number;
  sidebarVariant: "temporary" | "permanent";
}
const useStyles = makeStyles({
  toolbar: {
    justifyContent: "space-between",
    marginLeft: ({ drawerWidth, sidebarVariant }: StyleArgs) =>
      sidebarVariant === "temporary" ? 0 : drawerWidth,
  },
  menuButton: {
    marginRight: ({ theme }) => theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
});

export default function AppHeader() {
  const theme = useTheme();
  const { drawerWidth, variant: sidebarVariant, toggleSidebar } = useSidebar();
  const classes = useStyles({ theme, drawerWidth, sidebarVariant });

  const location = useLocation();
  // e.g. "/article/edit" => "article"
  const mainPath = (location.pathname.split("/")[1] as NavRoute) || NavRoute.overview;

  const smallScreen = useMediaQuery(AppHeaderSmallScreen);

  const pages: NavRoute[] = [
    NavRoute.clients,
    NavRoute.cars,
    NavRoute.orders,
    NavRoute.overview,
    NavRoute.documents,
    NavRoute.articles,
  ];

  return (
    <AppBar position="fixed">
      <Toolbar className={classes.toolbar}>
        {sidebarVariant === "permanent" ? null : (
          <IconButton
            edge="start"
            color="inherit"
            className={classes.menuButton}
            onClick={toggleSidebar}
            role="sidebar-toggle"
          >
            <Menu />
          </IconButton>
        )}
        {smallScreen ? null : (
          <Typography variant="h6" className={classes.title}>
            Werkstatt-App
          </Typography>
        )}
        {smallScreen ? (
          <PhoneNav currentPage={mainPath} pages={pages} />
        ) : (
          <MonitorNav currentPage={mainPath} pages={pages} />
        )}
      </Toolbar>
    </AppBar>
  );
}
