import firebase from './firebase';
import convertCreated from './convertCreated';

const requestProfile = async (profileId) => {
  const getDataFun = firebase.functions().httpsCallable('getData');

  const userGetObj = {
    searchKey: 'userId',
    searchValue: profileId,
    needProfile: true,
  };

  const user = await getDataFun(userGetObj);

  const images = user.data[0];

  const posts = user.data[1].map((tempPost) => {
    const post = tempPost;
    const created = convertCreated(post.created);
    post.created = created;
    return post;
  });

  const profile = user.data[2];

  const subscriptions = user.data[3];

  const notifications = user.data[4];

  return {
    images,
    posts,
    profile,
    subscriptions,
    notifications,
  };
};

export default requestProfile;
