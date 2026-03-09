const https = require('https');
const fs = require('fs');
const dotenv = fs.readFileSync('.env.local', 'utf8');
const env = {};
dotenv.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) env[k.trim()] = v.trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

https.get(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const spec = JSON.parse(data);
            console.log('Available tables/endpoints:');
            console.log(Object.keys(spec.paths));
        } catch (e) {
            console.log(data.substring(0, 1000));
        }
    });
});
