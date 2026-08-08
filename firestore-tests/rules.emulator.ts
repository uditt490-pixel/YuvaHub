// @ts-nocheck
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let testEnv: RulesTestEnvironment;
const RULES_PATH = resolve(process.cwd(), 'firestore.rules');

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'yuvahub-test',
    firestore: { rules: readFileSync(RULES_PATH, 'utf8') },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

async function seedUser(uid: string, role: string = 'user', extra: Record<string, any> = {}) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users', uid), {
      role,
      displayName: `User ${uid}`,
      email: `${uid}@example.com`,
      ...extra,
    });
  });
}

describe('/users/{userId}', () => {
  it('allows read for authenticated users', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertSucceeds(getDoc(doc(alice.firestore(), 'users', 'alice')));
  });

  it('denies read for unauthenticated users', async () => {
    const anon = testEnv.unauthenticatedContext();
    await seedUser('alice');
    await assertFails(getDoc(doc(anon.firestore(), 'users', 'alice')));
  });

  it('allows user to create own doc without isAdmin/isVerified', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'users', 'alice'), {
        displayName: 'Alice',
        email: 'alice@example.com',
        role: 'user',
      })
    );
  });

  it('DENIES privilege escalation via isAdmin on create', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertFails(
      setDoc(doc(alice.firestore(), 'users', 'alice'), {
        displayName: 'Alice',
        email: 'alice@example.com',
        role: 'user',
        isAdmin: true,
      })
    );
  });

  it('DENIES privilege escalation via isVerified on create', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertFails(
      setDoc(doc(alice.firestore(), 'users', 'alice'), {
        displayName: 'Alice',
        email: 'alice@example.com',
        role: 'user',
        isVerified: true,
      })
    );
  });

  // NEW: Test role escalation
  it('DENIES privilege escalation via role=admin on create', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertFails(
      setDoc(doc(alice.firestore(), 'users', 'alice'), {
        displayName: 'Alice',
        email: 'alice@example.com',
        role: 'admin',
      })
    );
  });

  it('DENIES privilege escalation via role=organizer on create', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await assertFails(
      setDoc(doc(alice.firestore(), 'users', 'alice'), {
        displayName: 'Alice',
        email: 'alice@example.com',
        role: 'organizer',
      })
    );
  });

  it('allows user to update own safe fields', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertSucceeds(
      updateDoc(doc(alice.firestore(), 'users', 'alice'), { displayName: 'Alice Updated' })
    );
  });

  it('DENIES privilege escalation via isAdmin on update', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertFails(
      updateDoc(doc(alice.firestore(), 'users', 'alice'), { isAdmin: true })
    );
  });

  it('DENIES privilege escalation via isVerified on update', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertFails(
      updateDoc(doc(alice.firestore(), 'users', 'alice'), { isVerified: true })
    );
  });

  // NEW: Test role change on update
  it('DENIES privilege escalation via role change on update', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertFails(
      updateDoc(doc(alice.firestore(), 'users', 'alice'), { role: 'admin' })
    );
  });

  it('DENIES user from updating another user', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('bob');
    await assertFails(
      updateDoc(doc(alice.firestore(), 'users', 'bob'), { displayName: 'Hacked' })
    );
  });

  it('allows user to delete own doc', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertSucceeds(deleteDoc(doc(alice.firestore(), 'users', 'alice')));
  });

  it('allows admin to delete any user doc', async () => {
    const admin = testEnv.authenticatedContext('admin-user', { email: 'admin@example.com' });
    await seedUser('admin-user', 'admin');
    await seedUser('victim');
    await assertSucceeds(deleteDoc(doc(admin.firestore(), 'users', 'victim')));
  });
});

describe('/opportunities/{oppId}', () => {
  it('allows authenticated read', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@example.com' });
    await seedUser('bob');
    await setDoc(doc(bob.firestore(), 'opportunities', 'opp1'), {
      title: 'Internship', submitterUid: 'bob',
    });
    await assertSucceeds(getDoc(doc(alice.firestore(), 'opportunities', 'opp1')));
  });

  it('allows create with matching submitterUid', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'opportunities', 'opp1'), {
        title: 'New Internship', submitterUid: 'alice',
      })
    );
  });

  it('DENIES create with mismatched submitterUid', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'opportunities', 'opp1'), {
        title: 'New Internship', submitterUid: 'bob',
      })
    );
  });

  it('allows submitter to update', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await setDoc(doc(alice.firestore(), 'opportunities', 'opp1'), {
      title: 'Internship', submitterUid: 'alice',
    });
    await assertSucceeds(
      updateDoc(doc(alice.firestore(), 'opportunities', 'opp1'), { title: 'Updated' })
    );
  });

  it('DENIES non-owner update', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@example.com' });
    await seedUser('alice');
    await seedUser('bob');
    await setDoc(doc(bob.firestore(), 'opportunities', 'opp1'), {
      title: 'Internship', submitterUid: 'bob',
    });
    await assertFails(
      updateDoc(doc(alice.firestore(), 'opportunities', 'opp1'), { title: 'Hacked' })
    );
  });

  it('allows admin to delete any opportunity', async () => {
    const admin = testEnv.authenticatedContext('admin-user', { email: 'admin@example.com' });
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('admin-user', 'admin');
    await seedUser('alice');
    await setDoc(doc(alice.firestore(), 'opportunities', 'opp1'), {
      title: 'Internship', submitterUid: 'alice',
    });
    await assertSucceeds(deleteDoc(doc(admin.firestore(), 'opportunities', 'opp1')));
  });
});

describe('/events/{eventId}', () => {
  it('allows organizer to create with own createdBy', async () => {
    const org = testEnv.authenticatedContext('org1', { email: 'org1@example.com' });
    await seedUser('org1', 'organizer');
    await assertSucceeds(
      setDoc(doc(org.firestore(), 'events', 'evt1'), { title: 'Hackathon', createdBy: 'org1' })
    );
  });

  // NEW: Test forged createdBy
  it('DENIES organizer from creating event with forged createdBy', async () => {
    const org = testEnv.authenticatedContext('org1', { email: 'org1@example.com' });
    await seedUser('org1', 'organizer');
    await assertFails(
      setDoc(doc(org.firestore(), 'events', 'evt1'), { title: 'Hackathon', createdBy: 'org2' })
    );
  });

  it('allows organizer to update own event', async () => {
    const org = testEnv.authenticatedContext('org1', { email: 'org1@example.com' });
    await seedUser('org1', 'organizer');
    await setDoc(doc(org.firestore(), 'events', 'evt1'), { title: 'Hackathon', createdBy: 'org1' });
    await assertSucceeds(
      updateDoc(doc(org.firestore(), 'events', 'evt1'), { title: 'Updated' })
    );
  });

  it('DENIES organizer from updating another organizer event', async () => {
    const org1 = testEnv.authenticatedContext('org1', { email: 'org1@example.com' });
    const org2 = testEnv.authenticatedContext('org2', { email: 'org2@example.com' });
    await seedUser('org1', 'organizer');
    await seedUser('org2', 'organizer');
    await setDoc(doc(org1.firestore(), 'events', 'evt1'), { title: 'Hackathon', createdBy: 'org1' });
    await assertFails(
      updateDoc(doc(org2.firestore(), 'events', 'evt1'), { title: 'Hacked' })
    );
  });

  it('DENIES organizer from deleting another organizer event', async () => {
    const org1 = testEnv.authenticatedContext('org1', { email: 'org1@example.com' });
    const org2 = testEnv.authenticatedContext('org2', { email: 'org2@example.com' });
    await seedUser('org1', 'organizer');
    await seedUser('org2', 'organizer');
    await setDoc(doc(org1.firestore(), 'events', 'evt1'), { title: 'Hackathon', createdBy: 'org1' });
    await assertFails(deleteDoc(doc(org2.firestore(), 'events', 'evt1')));
  });

  it('allows admin to update any event', async () => {
    const admin = testEnv.authenticatedContext('admin-user', { email: 'admin@example.com' });
    const org1 = testEnv.authenticatedContext('org1', { email: 'org1@example.com' });
    await seedUser('admin-user', 'admin');
    await seedUser('org1', 'organizer');
    await setDoc(doc(org1.firestore(), 'events', 'evt1'), { title: 'Hackathon', createdBy: 'org1' });
    await assertSucceeds(
      updateDoc(doc(admin.firestore(), 'events', 'evt1'), { title: 'Admin Updated' })
    );
  });
});

describe('/groups/{groupId}', () => {
  // NEW: Test forged createdBy
  it('DENIES organizer from creating group with forged createdBy', async () => {
    const org = testEnv.authenticatedContext('org1', { email: 'org1@example.com' });
    await seedUser('org1', 'organizer');
    await assertFails(
      setDoc(doc(org.firestore(), 'groups', 'grp1'), { name: 'Study', createdBy: 'org2' })
    );
  });

  it('DENIES organizer from deleting another organizer group', async () => {
    const org1 = testEnv.authenticatedContext('org1', { email: 'org1@example.com' });
    const org2 = testEnv.authenticatedContext('org2', { email: 'org2@example.com' });
    await seedUser('org1', 'organizer');
    await seedUser('org2', 'organizer');
    await setDoc(doc(org1.firestore(), 'groups', 'grp1'), { name: 'Study', createdBy: 'org1' });
    await assertFails(deleteDoc(doc(org2.firestore(), 'groups', 'grp1')));
  });
});

describe('/mentor_applications/{appId}', () => {
  it('allows user to read own application', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await setDoc(doc(alice.firestore(), 'mentor_applications', 'app1'), {
      submitterUid: 'alice', status: 'pending',
    });
    await assertSucceeds(getDoc(doc(alice.firestore(), 'mentor_applications', 'app1')));
  });

  it('DENIES user from reading another application', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@example.com' });
    await seedUser('alice');
    await seedUser('bob');
    await setDoc(doc(bob.firestore(), 'mentor_applications', 'app1'), {
      submitterUid: 'bob', status: 'pending',
    });
    await assertFails(getDoc(doc(alice.firestore(), 'mentor_applications', 'app1')));
  });

  it('allows admin to read any application', async () => {
    const admin = testEnv.authenticatedContext('admin-user', { email: 'admin@example.com' });
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('admin-user', 'admin');
    await seedUser('alice');
    await setDoc(doc(alice.firestore(), 'mentor_applications', 'app1'), {
      submitterUid: 'alice', status: 'pending',
    });
    await assertSucceeds(getDoc(doc(admin.firestore(), 'mentor_applications', 'app1')));
  });
});

describe('/community_posts/{postId}', () => {
  it('allows unauthenticated read', async () => {
    const anon = testEnv.unauthenticatedContext();
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await setDoc(doc(alice.firestore(), 'community_posts', 'post1'), { uid: 'alice', title: 'Hello' });
    await assertSucceeds(getDoc(doc(anon.firestore(), 'community_posts', 'post1')));
  });

  it('allows user to create own post', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'community_posts', 'post1'), { uid: 'alice', title: 'Hello' })
    );
  });

  it('DENIES creating post with mismatched uid', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'community_posts', 'post1'), { uid: 'bob', title: 'Impersonation' })
    );
  });

  it('DENIES user from updating another post', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@example.com' });
    await seedUser('alice');
    await seedUser('bob');
    await setDoc(doc(bob.firestore(), 'community_posts', 'post1'), { uid: 'bob', title: 'Bob Post' });
    await assertFails(
      updateDoc(doc(alice.firestore(), 'community_posts', 'post1'), { title: 'Hacked' })
    );
  });
});

describe('/user_feeds/{feedId}', () => {
  it('allows user to read/write own feed', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'user_feeds', 'alice'), { items: [] })
    );
    await assertSucceeds(getDoc(doc(alice.firestore(), 'user_feeds', 'alice')));
  });

  it('allows user to read/write composite feed they own', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'user_feeds', 'alice_main'), { items: [] })
    );
  });

  it('DENIES writing another user feed', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com' });
    await seedUser('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'user_feeds', 'bob'), { items: [] })
    );
  });
});
