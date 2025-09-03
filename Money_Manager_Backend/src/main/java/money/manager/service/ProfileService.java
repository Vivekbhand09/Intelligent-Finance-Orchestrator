package money.manager.service;


import lombok.RequiredArgsConstructor;
import money.manager.dto.AuthDTO;
import money.manager.dto.ProfileDTO;
import money.manager.entity.ProfileEntity;
import money.manager.repository.ProfileRepository;
import money.manager.util.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Value("${app.activation.url}")
    private String activationURL;

    public ProfileDTO registerProfile(ProfileDTO profileDTO) {
        ProfileEntity newProfile = toEntity(profileDTO);
        newProfile.setActivationToken(UUID.randomUUID().toString());
        newProfile = profileRepository.save(newProfile);
        //send activation email
        String activationLink = activationURL+"/api/v1.0/activate?token=" + newProfile.getActivationToken();
        String subject = "Activate your Money Manager account";
       // String body = "Click on the following link to activate your account: " + activationLink;
        String body = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; }" +
                ".container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }" +
                ".header { text-align: center; color: #4CAF50; font-size: 24px; margin-bottom: 20px; }" +
                ".content { font-size: 16px; color: #333333; line-height: 1.6; }" +
                ".btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }" +
                ".footer { margin-top: 30px; font-size: 14px; color: #777; text-align: center; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>Welcome to Money Manager!</div>" +
                "<div class='content'>" +
                "<p>Hi <b>" + newProfile.getFullName() + "</b>,</p>" +
                "<p>Thank you for registering with <b>Money Manager</b>. To activate your account and start managing your income and expenses, please click the button below:</p>" +
                "<p style='text-align:center;'><a href='" + activationLink + "' class='btn'>Activate My Account</a></p>" +
                "<p>If the button above does not work, you can copy and paste the following link into your browser:</p>" +
                "<p><a href='" + activationLink + "'>" + activationLink + "</a></p>" +
                "<p>If you did not sign up for this account, please ignore this email.</p>" +
                "</div>" +
                "<div class='footer'>© 2025 Money Manager | Manage your finances smarter</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        emailService.sendEmail(newProfile.getEmail(), subject, body);
        return toDTO(newProfile);
    }

    public ProfileEntity toEntity(ProfileDTO profileDTO) {
        return ProfileEntity.builder()
                .id(profileDTO.getId())
                .fullName(profileDTO.getFullName())
                .email(profileDTO.getEmail())
                .password(passwordEncoder.encode(profileDTO.getPassword()))
                .profileImageUrl(profileDTO.getProfileImageUrl())
                .createdAt(profileDTO.getCreatedAt())
                .updatedAt(profileDTO.getUpdatedAt())
                .build();
    }

    public ProfileDTO toDTO(ProfileEntity profileEntity) {
        return ProfileDTO.builder()
                .id(profileEntity.getId())
                .fullName(profileEntity.getFullName())
                .email(profileEntity.getEmail())
                .profileImageUrl(profileEntity.getProfileImageUrl())
                .createdAt(profileEntity.getCreatedAt())
                .updatedAt(profileEntity.getUpdatedAt())
                .build();
    }

    public boolean activateProfile(String activationToken) {
        return profileRepository.findByActivationToken(activationToken)
                .map(profile -> {
                    profile.setIsActive(true);
                    profileRepository.save(profile);
                    return true;
                })
                .orElse(false);
    }

    public boolean isAccountActive(String email) {
        return profileRepository.findByEmail(email)
                .map(ProfileEntity::getIsActive)
                .orElse(false);
    }

    public ProfileEntity getCurrentProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return profileRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Profile not found with email: " + authentication.getName()));
    }

    public ProfileDTO getPublicProfile(String email) {
        ProfileEntity currentUser = null;
        if (email == null) {
            currentUser = getCurrentProfile();
        }else {
            currentUser = profileRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Profile not found with email: " + email));
        }

        return ProfileDTO.builder()
                .id(currentUser.getId())
                .fullName(currentUser.getFullName())
                .email(currentUser.getEmail())
                .profileImageUrl(currentUser.getProfileImageUrl())
                .createdAt(currentUser.getCreatedAt())
                .updatedAt(currentUser.getUpdatedAt())
                .build();
    }

    public Map<String, Object> authenticateAndGenerateToken(AuthDTO authDTO) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authDTO.getEmail(), authDTO.getPassword()));
            //Generate JWT token
            String token = jwtUtil.generateToken(authDTO.getEmail());
            return Map.of(
                    "token", token,
                    "user", getPublicProfile(authDTO.getEmail())
            );
        } catch (Exception e) {
            throw new RuntimeException("Invalid email or password");
        }
    }
}
