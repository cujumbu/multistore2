import { Store } from '../types/store';
import { supabase } from './supabase';

// Validate domain format and security
export function isValidDomain(domain: string): boolean {
  // Allow development domains
  const devDomains = [
    'tasker.dk',
    'localhost',
    'webcontainer',
    'stackblitz',
    'local-credentialless'
  ];
  
  // Check if it's a development domain
  if (devDomains.some(dev => domain.includes(dev))) {
    return true;
  }
  
  // Only allow valid domain characters and formats
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

// Verify store ownership
export async function verifyStoreAccess(storeId: string, userId: string): Promise<boolean> {
  if (!storeId || !userId) {
    console.error('Missing required parameters:', { storeId, userId });
    return false;
  }
  
  console.log('Starting store access verification:', { 
    storeId, 
    userId,
    timestamp: new Date().toISOString()
  });

  try {
    const { data, error } = await supabase
      .from('stores')
      .select(`
        id,
        name,
        domain,
        owner_id,
        active
      `)
      .eq('id', storeId)
      .eq('active', true)
      .single();
    
    if (error) {
      console.error('Database error during access verification:', {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        context: { storeId, userId },
        timestamp: new Date().toISOString()
      });
      return false;
    }
    
    if (!data) {
      console.error('No active store found:', { 
        storeId,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    if (!data.owner_id) {
      console.error('Store has no owner:', {
        storeId: data.id,
        storeName: data.name,
        domain: data.domain,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    console.log('Store access check:', {
      storeId: data.id,
      storeName: data.name,
      ownerId: data.owner_id,
      requestingUserId: userId,
      timestamp: new Date().toISOString()
    });

    // Normalize UUIDs for comparison
    const normalizedOwnerId = data.owner_id?.toLowerCase();
    const normalizedUserId = userId?.toLowerCase();
    
    const hasAccess = normalizedOwnerId === normalizedUserId;
    
    if (!hasAccess) {
      console.warn('Access denied:', {
        reason: 'User is not the store owner',
        storeDetails: {
          id: data.id,
          name: data.name,
          domain: data.domain
        },
        ownerId: normalizedOwnerId,
        requestingUserId: normalizedUserId,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('Access granted:', {
        storeDetails: {
          id: data.id,
          name: data.name,
          domain: data.domain
        },
        ownerId: normalizedOwnerId,
        requestingUserId: normalizedUserId,
        timestamp: new Date().toISOString()
      });
    }

    return hasAccess;
  } catch (error) {
    console.error('Error in verifyStoreAccess:', error);
    return false;
  }
}