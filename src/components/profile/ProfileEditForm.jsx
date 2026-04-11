import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Mail, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '../ui/Base';

const createFormValues = (profile) => ({
    name: profile?.name || '',
    group: profile?.group || '',
    location: profile?.location || '',
    email: profile?.email || '',
});

const ProfileEditForm = ({ initialProfile, onCancel, onSave }) => {
    const [formValues, setFormValues] = useState(() => createFormValues(initialProfile));

    useEffect(() => {
        setFormValues(createFormValues(initialProfile));
    }, [initialProfile]);

    const isSaveDisabled = useMemo(
        () => Object.values(formValues).some((value) => !value.trim()),
        [formValues],
    );

    const handleChange = useCallback((event) => {
        const { name, value } = event.target;

        setFormValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));
    }, []);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();

        onSave({
            name: formValues.name.trim(),
            group: formValues.group.trim(),
            location: formValues.location.trim(),
            email: formValues.email.trim(),
        });
    }, [formValues, onSave]);

    return (
        <form onSubmit={handleSubmit} className="space-y-5" data-testid="profile-edit-form">
            <div className="space-y-4">
                <label htmlFor="profile-name" className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Name</span>
                    <div className="relative">
                        <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            id="profile-name"
                            name="name"
                            type="text"
                            value={formValues.name}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-transparent bg-gray-50 py-3 pl-12 pr-4 outline-none transition-all focus:border-accent dark:bg-gray-900"
                            required
                        />
                    </div>
                </label>

                <label htmlFor="profile-group" className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Group</span>
                    <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            id="profile-group"
                            name="group"
                            type="text"
                            value={formValues.group}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-transparent bg-gray-50 py-3 pl-12 pr-4 outline-none transition-all focus:border-accent dark:bg-gray-900"
                            required
                        />
                    </div>
                </label>

                <label htmlFor="profile-location" className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Location</span>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            id="profile-location"
                            name="location"
                            type="text"
                            value={formValues.location}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-transparent bg-gray-50 py-3 pl-12 pr-4 outline-none transition-all focus:border-accent dark:bg-gray-900"
                            required
                        />
                    </div>
                </label>

                <label htmlFor="profile-email" className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Email</span>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            id="profile-email"
                            name="email"
                            type="email"
                            value={formValues.email}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-transparent bg-gray-50 py-3 pl-12 pr-4 outline-none transition-all focus:border-accent dark:bg-gray-900"
                            required
                        />
                    </div>
                </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSaveDisabled}>
                    Save Profile
                </Button>
            </div>
        </form>
    );
};

ProfileEditForm.propTypes = {
    initialProfile: PropTypes.shape({
        name: PropTypes.string,
        group: PropTypes.string,
        location: PropTypes.string,
        email: PropTypes.string,
    }).isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};

export default ProfileEditForm;
