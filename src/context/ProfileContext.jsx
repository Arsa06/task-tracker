import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import PropTypes from 'prop-types';

const PROFILE_STORAGE_KEY = 'taskyy-profile';
const DEFAULT_PROFILE = {
    name: 'Arsen Kantpai',
    group: 'IT2-2307',
    location: 'Astana, Kazakhstan',
    email: 'arsen@taskyy.io',
};

const ProfileContext = createContext(null);

const sanitizeProfile = (profile = {}) => ({
    name: typeof profile.name === 'string' && profile.name.trim() ? profile.name.trim() : DEFAULT_PROFILE.name,
    group: typeof profile.group === 'string' && profile.group.trim() ? profile.group.trim() : DEFAULT_PROFILE.group,
    location: typeof profile.location === 'string' && profile.location.trim() ? profile.location.trim() : DEFAULT_PROFILE.location,
    email: typeof profile.email === 'string' && profile.email.trim() ? profile.email.trim() : DEFAULT_PROFILE.email,
});

export const useProfile = () => {
    const context = useContext(ProfileContext);

    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }

    return context;
};

export const ProfileProvider = ({ children, initialProfile = null }) => {
    const [profile, setProfile] = useState(() => {
        if (initialProfile) {
            return sanitizeProfile(initialProfile);
        }

        if (typeof window === 'undefined') {
            return DEFAULT_PROFILE;
        }

        try {
            const savedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);

            if (!savedProfile) {
                return DEFAULT_PROFILE;
            }

            return sanitizeProfile(JSON.parse(savedProfile));
        } catch {
            return DEFAULT_PROFILE;
        }
    });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        } catch {
            // Ignore storage errors and keep the in-memory profile available.
        }
    }, [profile]);

    const updateProfile = useCallback((nextProfile) => {
        setProfile((currentProfile) => sanitizeProfile({
            ...currentProfile,
            ...(typeof nextProfile === 'function' ? nextProfile(currentProfile) : nextProfile),
        }));
    }, []);

    const value = useMemo(() => ({
        profile,
        updateProfile,
    }), [profile, updateProfile]);

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

ProfileProvider.propTypes = {
    children: PropTypes.node.isRequired,
    initialProfile: PropTypes.shape({
        name: PropTypes.string,
        group: PropTypes.string,
        location: PropTypes.string,
        email: PropTypes.string,
    }),
};
