package com.cinebot.common.fallback;

import com.cinebot.user.application.UserContact;
import com.cinebot.user.application.UserQueryService;
import java.util.Optional;
import org.springframework.context.annotation.Fallback;
import org.springframework.stereotype.Component;

@Component
@Fallback
public class UserQueryServiceFallback implements UserQueryService {

    @Override
    public Optional<UserContact> findContact(long userId) {
        return Optional.empty();
    }
}
