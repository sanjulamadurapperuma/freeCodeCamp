import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

import Loader from '../components/helpers/Loader';
import {
  userByNameSelector,
  userProfileFetchStateSelector,
  fetchProfileForUser,
  usernameSelector
} from '../redux';
import FourOhFourPage from '../components/FourOhFour';
import Profile from '../components/profile/Profile';

const propTypes = {
  fetchProfileForUser: PropTypes.func.isRequired,
  isSessionUser: PropTypes.bool,
  maybeUser: PropTypes.string,
  requestedUser: PropTypes.shape({
    username: PropTypes.string,
    profileUI: PropTypes.object
  }),
  showLoading: PropTypes.bool
};

const createRequestedUserSelector = () => (state, { maybeUser = '' }) =>
  userByNameSelector(maybeUser.toLowerCase())(state);
const createIsSessionUserSelector = () => (state, { maybeUser = '' }) =>
  maybeUser.toLowerCase() === usernameSelector(state);

const makeMapStateToProps = () => (state, props) => {
  const requestedUserSelector = createRequestedUserSelector();
  const isSessionUserSelector = createIsSessionUserSelector();
  const fetchState = userProfileFetchStateSelector(state, props);
  return {
    requestedUser: requestedUserSelector(state, props),
    isSessionUser: isSessionUserSelector(state, props),
    showLoading: fetchState.pending,
    fetchState
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators({ fetchProfileForUser }, dispatch);

class ShowFourOhFour extends Component {
  componentDidMount() {
    const { requestedUser, maybeUser, fetchProfileForUser } = this.props;
    if (isEmpty(requestedUser)) {
      return fetchProfileForUser(maybeUser);
    }
    return null;
  }

  render() {
    const { isSessionUser, requestedUser, showLoading } = this.props;
    if (isEmpty(requestedUser)) {
      if (showLoading) {
        // We don't know if /:maybeUser is a user or not, we will show
        // the loader until we get a response from the API
        return <Loader fullScreen={true} />;
      }
      // We have a response from the API, but there is nothing in the store
      // for /:maybeUser. We can derive from this state the /:maybeUser is not
      // a user the API recognises, so we 404
      return <FourOhFourPage />;
    }

    // We have a response from the API, and we have some state in the
    // store for /:maybeUser, we now handover rendering to the Profile component
    return <Profile isSessionUser={isSessionUser} user={requestedUser} />;
  }
}

ShowFourOhFour.displayName = 'ShowFourOhFour';
ShowFourOhFour.propTypes = propTypes;

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(ShowFourOhFour);
