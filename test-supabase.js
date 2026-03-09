const { createClient } = require('./node_modules/@supabase/supabase-js');
const fs = require('fs');
const dotenv = fs.readFileSync('.env.local', 'utf8');
const env = {};
dotenv.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) env[k.trim()] = v.trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
    console.log('Checking connection setup...');
    const { data, error } = await supabase
        .from('transacciones')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error al conectar o consultar la tabla:', error.message);
    } else {
        console.log('Conexión exitosa. Datos en la tabla transacciones:', data);

        // Si no hay error, intentemos insertar uno de prueba
        console.log('Intentando insertar un ingreso de prueba...');
        const { data: insertData, error: insertError } = await supabase
            .from('transacciones')
            .insert({
                tipo: 'ingreso',
                monto: 99.99,
                categoria: 'Otros Ingresos',
                concepto: 'Ingreso de prueba desde script',
                metodo_pago: 'Efectivo',
            })
            .select();

        if (insertError) {
            console.error('Error al insertar:', insertError.message);
        } else {
            console.log('Inserción exitosa:', insertData);

            // Limpiar la prueba
            console.log('Limpiando prueba...');
            const { error: deleteError } = await supabase
                .from('transacciones')
                .delete()
                .eq('id', insertData[0].id);

            if (deleteError) {
                console.error('Error al limpiar:', deleteError.message);
            } else {
                console.log('Prueba limpiada con éxito.');
            }
        }
    }
}

checkConnection();
