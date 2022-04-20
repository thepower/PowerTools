import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import classname from 'classnames';
import { push } from 'connected-react-router';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { NavigationItemType } from '../typings/navigationTypings';
import { navigationItems } from '../utils/navigationUtils';
import styles from './Navigation.module.scss';

const mapDispatchToProps = {
  changeUrl: push,
};

const connector = connect(null, mapDispatchToProps);
type NavigationProps = ConnectedProps<typeof connector>;

type NavigationState = {
  currentItem: string;
};

class NavigationComponent extends React.PureComponent<NavigationProps, NavigationState> {
  drawerClasses = {
    paper: styles.navigation,
  };

  constructor(props: NavigationProps) {
    super(props);

    this.state = {
      currentItem: navigationItems[0].id,
    };
  }

  handleNavigateToItem = (navigationItem: NavigationItemType) => () => {
    const { changeUrl } = this.props;
    const { id, url } = navigationItem;

    changeUrl(url);
    this.setCurrentNavigationItem(id);
  };

  setCurrentNavigationItem = (currentItem: string) => {
    this.setState({ currentItem });
  };

  renderNavigationItem = (navigationItem: NavigationItemType) => {
    const { id, label } = navigationItem;
    const { currentItem } = this.state;

    return <ListItem
      key={id}
      className={styles.navigationItem}
      onClick={this.handleNavigateToItem(navigationItem)}
    >
      <ListItemText
        className={classname(styles.navigationLabel, currentItem === id ? styles.activeNavigationLabel : '')}
        primary={label}
      />
    </ListItem>;
  };

  render() {
    return <Drawer
      open
      anchor={'left'}
      variant='permanent'
      classes={this.drawerClasses}
    >
      <List>
        {(navigationItems || []).map(this.renderNavigationItem)}
      </List>
      <div className={styles.navigationBottomPart}>
        <div>{'Having problems?'}</div>
        <a className={styles.copyrightLink} href={'mailto:support@thepower.io'}>{'Email us'}</a>
        <a className={styles.copyrightLink} href='https://hub.thepower.io/'>
          {'Privacy policy'}
        </a>
        <a className={styles.copyrightLink} href='https://hub.thepower.io/'>
          {'Terms of use'}
        </a>
        <p>&copy; 2018–2022 Power_hub</p>
      </div>
    </Drawer>;
  }
}

export const Navigation = connector(NavigationComponent);
