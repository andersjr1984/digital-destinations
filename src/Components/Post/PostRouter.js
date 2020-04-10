import React from 'react';
import { Switch, Route } from 'react-router-dom';
import IndPost from './IndPost';
import AllPosts from './AllPosts';

// todo: add post component
const PostRouter = () => (
  <Switch>
    <Route
      exact
      path="/Posts/:postId"
      component={IndPost}
    />
    <Route
      exact
      path="/Posts"
      component={AllPosts}
    />
  </Switch>
);

export default PostRouter;
