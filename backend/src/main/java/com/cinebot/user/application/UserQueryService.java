package com.cinebot.user.application;

import java.util.Optional;

/** Profile lookup for checkout (ER-02). Implemented by task B4. */
public interface UserQueryService {

    /**
     * Member contact used to prefill checkout (BR-20).
     *
     * @return empty when the user does not exist
     */
    Optional<UserContact> findContact(long userId);
}
