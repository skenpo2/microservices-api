import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import UserModel from '../models/user.model';
import { config } from './app.config';

export const configureJwtStrategy = () => {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.ACCESS_TOKEN,
      },
      async (payload, done) => {
        try {
          const user = await UserModel.findById(payload.user.id);
          if (user) return done(null, user);
          return done(null, false);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
};
