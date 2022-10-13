import {
  BuildIcon,
  ContributeIcon,
  DiscoverIcon,
  HomeIcon,
  MyPlaceIcon,
} from 'common/icons';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { RoutesEnum } from '../../application';
import styles from './NavList.module.scss';

const routes = [
  {
    name: 'Home',
    link: RoutesEnum.root,
    Icon: HomeIcon,
    disabled: false,
  },
  {
    name: 'Discover',
    link: RoutesEnum.discover,
    Icon: DiscoverIcon,
    disabled: true,
  },
  {
    name: 'MyPlace',
    link: RoutesEnum.myPlace,
    Icon: MyPlaceIcon,
    disabled: true,
  },
  {
    name: 'Build',
    link: RoutesEnum.build,
    Icon: BuildIcon,
    disabled: true,
  },
  {
    name: 'Contribute',
    link: RoutesEnum.contribute,
    Icon: ContributeIcon,
    disabled: true,
  },
];

const NavList = React.memo(() => (
  <nav>
    <ul className={styles.list}>
      {routes.map(({
        disabled,
        Icon,
        link,
        name,
      }) => (
        <NavLink
          key={name}
          aria-disabled={disabled}
          exact
          to={link}
          className={styles.link}
          activeClassName={styles.linkActive}
        >
          <Icon className={styles.icon} />
          <span className={styles.text}>{name}</span>
        </NavLink>
      ))}
    </ul>
  </nav>
));

export default NavList;
