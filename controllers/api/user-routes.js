const router = require('express').Router();
const { User } = require('../../models');
// const withAuth = require('../../utils/auth');

router.get('/', async (req, res) => {
  try {
    const userData = await User.findAll();
    const users = userData.map((user) => user.toJSON());
    res.status(200).json({ users: users });
    console.log(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    console.log(req.body);
    const userData = await User.create(req.body);

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.status(200).json(userData);
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({
      where: { username: req.body.username },
    });

    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect username or password, please try again' });
      return;
    }
    console.log(req.body);
    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect username or password, please try again' });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.json({ user: userData, message: 'You are now logged in!' });
    });
  } catch (err) {
    res.status(400).json(err);
  }
});
router.put('/add-to-project', async (req, res) => {
  try {
    const updateUser = await User.update(
      {
        project_id: req.body.project_id,
      },
      {
        where: { username: req.body.username },
      },
    );

    if (!updateUser[0]) {
      res
        .status(400)
        .json({
          message: 'No project found with that id, or username is incorrect.',
        });
      return;
    }
    res.status(200).json({ message: 'User added to project.' });
  } catch (err) {
    res.status(400).json(err);
  }
});
router.put('/remove-from-project/:id', async (req, res) => {
  try {
    const removeUser = await User.update(
      {
        project_id: null,
      },
      {
        where: { username: req.params.id },
      },
    );

    if (!removeUser[0]) {
      res
        .status(400)
        .json({
          message: 'No project found with that id, or username is incorrect.',
        });
      return;
    }
    res.status(200).redirect('back');
  } catch (err) {
    res.status(400).json(err);
  }
});
router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
