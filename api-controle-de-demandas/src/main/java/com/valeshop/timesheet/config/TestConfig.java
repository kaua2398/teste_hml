//    package com.valeshop.timesheet.config;
//
//    import com.valeshop.timesheet.entities.user.User;
//    import com.valeshop.timesheet.entities.user.UserType;
//    import com.valeshop.timesheet.repositories.UserRepository;
//    import org.springframework.beans.factory.annotation.Autowired;
//    import org.springframework.boot.CommandLineRunner;
//    import org.springframework.context.annotation.Configuration;
//    import org.springframework.context.annotation.Profile;
//    import org.springframework.security.crypto.password.PasswordEncoder;
//
//    import java.util.Arrays;
//
//    @Configuration
//    @Profile("test")
//    public class TestConfig implements CommandLineRunner {
//
//        @Autowired
//        private UserRepository userRepository;
//
//        @Autowired
//        private PasswordEncoder passwordEncoder;
//
//        @Override
//        public void run(String... args) throws Exception {
//            String encodedPassword = passwordEncoder.encode("123456");
//
//            User admin = new User(null,"hazevedo@valeshop.com.br", encodedPassword, UserType.Administrador);
//            User normal = new User(null,"smota@valeshop.com.br", encodedPassword, UserType.Normal);
//
//            userRepository.saveAll(Arrays.asList(admin,normal));
//        }
//    }
