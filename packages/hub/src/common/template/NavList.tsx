import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './NavList.module.scss';
import { ReactComponent as ContributeIcon } from './icons/contribute.svg';
import { ReactComponent as HomeIcon } from './icons/home.svg';
import { ReactComponent as BuildIcon } from './icons/build.svg';
import { ReactComponent as DiscoverIcon } from './icons/discover.svg';
import { ReactComponent as MyPlaceIcon } from './icons/my-place.svg';

const routes = [
  {
    name: 'Home',
    link: '/',
    Icon: HomeIcon,
    disabled: false,
  },
  {
    name: 'Discover',
    link: '/discover',
    Icon: DiscoverIcon,
    disabled: true,
  },
  {
    name: 'MyPlace',
    link: '/my-place',
    Icon: MyPlaceIcon,
    disabled: true,
  },
  {
    name: 'Build',
    link: '/build',
    Icon: BuildIcon,
    disabled: true,
  },
  {
    name: 'Contribute',
    link: '/contribute',
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
