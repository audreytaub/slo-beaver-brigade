import React, { useState, useEffect } from 'react';
import styles from '../styles/profile/profile.module.css';
import { PencilIcon } from '@heroicons/react/16/solid';
import { useUser } from '@clerk/clerk-react';
import Link from 'next/link';
import EditProfile from '@components/EditProfile';
import { getUserDbData } from 'app/lib/authentication';
import { IUser } from 'database/userSchema';
import '../fonts/fonts.css';
import DeleteConfirmation from './DeleteConfirmation';
import ChangeEmail from '@components/ChangeEmail';
import { StatUpArrow } from '@chakra-ui/react';

export default function UserProfile() {
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDataUpdated, setIsDataUpdated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getUserDbData();
        if (userRes) {
          const userData = JSON.parse(userRes);
          setUserData(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isDataUpdated]);

  const closeFromChild = () => {
    return null;
  };

  const displayNewInfo = () => {
    setIsDataUpdated(true);
  };

  return (
    <div className={styles.profileContainer}>
      <div className={`${styles.infoGroup} ${styles.leftInfoGroup}`}>
        <div className={styles.infoHeader}>
          <h2 className={styles.infoTitle}>Account</h2>
          <h2 className={styles.editButton}>
            <ChangeEmail
              userData={userData}
              changeProfileEmail={displayNewInfo}
            />
          </h2>
        </div>
        <div className={styles.infoFields}>
          <div>
            <div className={styles.fieldTitle}>Email Address</div>
            {userData ? userData?.email : <div>Loading...</div>}
          </div>
        </div>
        <div className={styles.deleteButton}>
          <DeleteConfirmation
            closeFromChild={closeFromChild}
            userData={userData}
            isSelf={true}
          ></DeleteConfirmation>
        </div>
      </div>
      <div className={`${styles.infoGroup} ${styles.rightInfoGroup}`}>
        <div className={styles.infoHeader}>
          <h2 className={styles.infoTitle}>Personal</h2>
          <h2 className={styles.editButton}>
            <EditProfile userData={userData} displayNewInfo={displayNewInfo} />
          </h2>
        </div>
        <div className={styles.infoFields}>
          <div>
            <div className={styles.fieldTitle}>First Name</div>
            {userData ? userData.firstName : <div>Loading...</div>}

            <div className={styles.fieldTitle}>Last Name</div>
            {userData ? userData.lastName : <div>Loading...</div>}
          </div>
          <div>
            <div className={styles.fieldTitle}>Phone Number</div>
            {userData ? userData.phoneNumber : <div>Loading...</div>}
            <div className={styles.fieldTitle}>Zipcode</div>
            {userData ? userData.zipcode : <div>Loading...</div>}
          </div>
          <div>
            <div className={styles.fieldTitle}>Receive Newsletter</div>
            <span className={userData?.receiveNewsletter ? 'yes' : 'no'}>
              {userData ? (
                userData?.receiveNewsletter ? (
                  'Yes'
                ) : (
                  'No'
                )
              ) : (
                <div>Loading...</div>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
