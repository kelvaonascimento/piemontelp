export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nome, email, whatsapp } = req.body;

    // Validação básica
    if (!nome || !email || !whatsapp) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, email, whatsapp' });
    }

    // Enviar para RD Station
    const rdStationToken = process.env.RD_STATION_API_TOKEN;

    if (!rdStationToken) {
      console.error('RD_STATION_API_TOKEN não configurado');
      return res.status(500).json({ error: 'Configuração do servidor incompleta' });
    }

    const rdPayload = {
      event_type: 'CONVERSION',
      event_family: 'CDP',
      payload: {
        conversion_identifier: 'landing-page-piemonte',
        name: nome,
        email: email,
        mobile_phone: whatsapp.replace(/\D/g, ''),
        cf_empreendimento: 'Piemonté',
        tags: ['landing-page', 'piemonte'],
      },
    };

    const rdResponse = await fetch('https://api.rd.services/platform/conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rdStationToken}`,
      },
      body: JSON.stringify(rdPayload),
    });

    if (!rdResponse.ok) {
      const errorText = await rdResponse.text();
      console.error('RD Station error:', rdResponse.status, errorText);
      return res.status(500).json({ error: 'Erro ao enviar para RD Station', details: errorText });
    }

    console.log('Lead enviado ao RD Station com sucesso');
    return res.status(200).json({ success: true, message: 'Lead recebido com sucesso!' });

  } catch (error) {
    console.error('Erro ao processar lead:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
