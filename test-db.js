// Quick test to verify database connection and message insertion
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDb() {
  console.log('Testing database connection...')
  
  // Test 1: Check if we can read chats
  try {
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('Error reading chats:', error)
    } else {
      console.log('✅ Can read chats:', chats?.length || 0, 'found')
    }
  } catch (e) {
    console.error('Exception reading chats:', e)
  }
  
  // Test 2: Check if we can read messages
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('Error reading messages:', error)
    } else {
      console.log('✅ Can read messages:', messages?.length || 0, 'found')
    }
  } catch (e) {
    console.error('Exception reading messages:', e)
  }
  
  // Test 3: Try to insert a test message (if we have a chat)
  try {
    const { data: chats } = await supabase
      .from('chats')
      .select('id, owner_id')
      .limit(1)
    
    if (chats && chats.length > 0) {
      const testChat = chats[0]
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: testChat.id,
          owner_id: testChat.owner_id,
          role: 'assistant',
          content: 'Test message from debug script',
          model: 'test-model',
          created_at: new Date().toISOString()
        })
        .select()
      
      if (error) {
        console.error('❌ Cannot insert test message:', error)
      } else {
        console.log('✅ Successfully inserted test message:', data)
        
        // Clean up - delete the test message
        await supabase
          .from('messages')
          .delete()
          .eq('content', 'Test message from debug script')
      }
    } else {
      console.log('⚠️ No chats found to test message insertion')
    }
  } catch (e) {
    console.error('Exception testing message insertion:', e)
  }
}

testDb().then(() => {
  console.log('Database test completed')
  process.exit(0)
}).catch(e => {
  console.error('Database test failed:', e)
  process.exit(1)
})
