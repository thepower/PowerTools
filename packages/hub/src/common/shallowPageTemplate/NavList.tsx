import {
  BuildIcon,
  ContributeIcon,
  DiscoverIcon,
  HomeIcon,
  MyPlaceIcon,
} from 'common/icons';
import React, { MouseEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { connect, ConnectedProps } from 'react-redux';
import { RoutesEnum } from '../../application/typings/routes';
import styles from './NavList.module.scss';
import { setShowUnderConstruction } from '../../application/slice/applicationSlice';

const mapDispatchToProps = {
  setShowUnderConstruction,
};

const connector = connect(null, mapDispatchToProps);
type NavListProps = ConnectedProps<typeof connector>;

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

const NavList = React.memo(({ setShowUnderConstruction }: NavListProps) => {
  const handleShowUnderConstruction = React.useCallback((event: MouseEvent) => {
    event.preventDefault();
    setShowUnderConstruction(true);
  }, [setShowUnderConstruction]);

  return <nav>
    <ul className={styles.list}>
      {routes.map(({
        disabled,
        Icon,
        link,
        name,
      }) => (
        <NavLink
          key={name}
          exact
          to={link}
          className={styles.link}
          activeClassName={styles.linkActive}
          onClick={disabled ? handleShowUnderConstruction : undefined}
        >
          <Icon className={styles.icon} />
          <span className={styles.text}>{name}</span>
        </NavLink>
      ))}
    </ul>
  </nav>;
});

export default connector(NavList);
