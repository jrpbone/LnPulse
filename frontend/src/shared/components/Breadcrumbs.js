import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const getBreadcrumbName = (path) => {
    switch (path) {
      case 'Dashboard':
        return 'Dashboard';
      case 'Students':
        return 'Students';
      case 'Student':
        return 'Student Details';
      case 'Grades':
        return 'Grades';
      case 'Sections':
        return 'Sections';
      case 'SectionStudents':
        return 'Section Students';
      case 'Curriculum':
        return 'Curriculum';
      case 'Settings':
        return 'Settings';
      default:
        return path;
    }
  };

  return (
    <nav className="breadcrumbs">
      <Link to="/" className="breadcrumb-link">Home</Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = getBreadcrumbName(value);

        return (
          <React.Fragment key={to}>
            <span className="breadcrumb-separator">/</span>
            {isLast ? (
              <span className="breadcrumb-current">{displayName}</span>
            ) : (
              <Link to={to} className="breadcrumb-link">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs; 