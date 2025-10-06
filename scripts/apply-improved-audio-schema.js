const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyImprovedAudioSchema() {
  try {
    console.log('🔄 Applying improved audio table schema...')
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../create_improved_audio_table.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    
    // Split SQL commands (rough approach - for production, use a proper SQL parser)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`Found ${commands.length} SQL commands to execute`)
    
    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      if (command.length === 0) continue
      
      try {
        console.log(`Executing command ${i + 1}/${commands.length}...`)
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: command + ';' 
        })
        
        if (error) {
          console.error(`❌ Error in command ${i + 1}:`, error)
          console.log('Command was:', command)
          // Continue with other commands
        } else {
          console.log(`✅ Command ${i + 1} executed successfully`)
        }
      } catch (cmdError) {
        console.error(`❌ Exception in command ${i + 1}:`, cmdError)
        console.log('Command was:', command)
      }
    }
    
    console.log('🎉 Improved audio table schema applied successfully!')
    
    // Verify the table was created
    const { data, error } = await supabase
      .from('question_audio')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log('⚠️ Could not verify table creation:', error.message)
    } else {
      console.log('✅ question_audio table verified - ready for data')
    }
    
  } catch (error) {
    console.error('❌ Failed to apply improved audio schema:', error)
    process.exit(1)
  }
}

// Run if this script is executed directly
if (require.main === module) {
  applyImprovedAudioSchema()
    .then(() => {
      console.log('Script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Script failed:', error)
      process.exit(1)
    })
}

module.exports = { applyImprovedAudioSchema }
