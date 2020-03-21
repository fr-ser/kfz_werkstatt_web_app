import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { makeStyles, Theme } from "@material-ui/core/styles";
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

const useStyles = makeStyles((theme: Theme) => ({
  toolbar: {
    justifyContent: "space-between",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  tab: {
    opacity: 1,
    minWidth: "unset",
  },
  phoneTab: {
    textTransform: "capitalize",
  },
}));

interface NavProps {
  currentPage: NavRoute;
  pages: NavRoute[];
}

function PhoneNav({ currentPage, pages }: NavProps) {
  const classes = useStyles();
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
  const classes = useStyles();

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

export default function AppHeader() {
  const classes = useStyles();
  const location = useLocation();
  // e.g. "/article/edit" => "article"
  const mainPath = (location.pathname.split("/")[1] as NavRoute) || NavRoute.overview;

  const smallScreen = useMediaQuery("(max-width:900px)");

  const pages: NavRoute[] = [
    NavRoute.clients,
    NavRoute.cars,
    NavRoute.orders,
    NavRoute.overview,
    NavRoute.documents,
    NavRoute.articles,
  ];

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <IconButton edge="start" className={classes.menuButton} color="inherit">
          <Menu />
        </IconButton>
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
