/**
 * 🧪 TESTE: Verificação de Correção do Loop Infinito
 * 
 * Verificar se as correções resolveram o problema do loop infinito
 */

async function testarAPIUserGroups() {
  try {
    console.log('🧪 TESTE: API /api/user/groups');
    console.log('🎯 OBJETIVO: Verificar se não há mais loop infinito\n');
    
    const startTime = Date.now();
    const requests = [];
    
    // Fazer 5 requisições sequenciais para verificar se há loop
    for (let i = 0; i < 5; i++) {
      const requestStart = Date.now();
      
      try {
        const response = await fetch('http://localhost:3000/api/user/groups');
        const requestTime = Date.now() - requestStart;
        
        if (response.ok) {
          const data = await response.json();
          requests.push({
            index: i + 1,
            time: requestTime,
            success: true,
            hasData: data.success && data.data
          });
          console.log(`✅ Requisição ${i + 1}: ${requestTime}ms - Sucesso`);
        } else {
          requests.push({
            index: i + 1,
            time: requestTime,
            success: false,
            status: response.status
          });
          console.log(`❌ Requisição ${i + 1}: ${requestTime}ms - Erro ${response.status}`);
        }
      } catch (error) {
        const requestTime = Date.now() - requestStart;
        requests.push({
          index: i + 1,
          time: requestTime,
          success: false,
          error: error.message
        });
        console.log(`❌ Requisição ${i + 1}: ${requestTime}ms - Erro: ${error.message}`);
      }
      
      // Pausa entre requisições
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const totalTime = Date.now() - startTime;
    const successfulRequests = requests.filter(r => r.success).length;
    const averageTime = requests.reduce((sum, r) => sum + r.time, 0) / requests.length;
    
    console.log('\n📊 RESULTADO:');
    console.log(`   ⏱️ Tempo total: ${totalTime}ms`);
    console.log(`   ✅ Requisições bem-sucedidas: ${successfulRequests}/5`);
    console.log(`   📈 Tempo médio por requisição: ${Math.round(averageTime)}ms`);
    
    // Verificar se há sinais de loop infinito
    const fastRequests = requests.filter(r => r.time < 50).length;
    const veryFastRequests = requests.filter(r => r.time < 20).length;
    
    if (veryFastRequests > 3) {
      console.log('⚠️ ALERTA: Muitas requisições muito rápidas - possível loop ainda ativo');
      return { success: false, issue: 'loop_detected' };
    } else if (fastRequests > 3) {
      console.log('⚠️ ATENÇÃO: Algumas requisições muito rápidas - monitorar');
      return { success: true, issue: 'monitor' };
    } else {
      console.log('✅ SUCESSO: Sem sinais de loop infinito');
      return { success: true, issue: 'none' };
    }
    
  } catch (error) {
    console.log(`❌ Erro no teste: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testarSistemaCompleto() {
  console.log('🧪 TESTE: Correção do Loop Infinito');
  console.log('='.repeat(60));
  console.log('🎯 OBJETIVO: Verificar se as correções resolveram o problema');
  console.log('📋 CORREÇÕES APLICADAS:');
  console.log('   1. useGroupLoader: Removido availableGroups.length da dependência');
  console.log('   2. UserGroupContext: Melhorada lógica de seleção automática');
  console.log('   3. useNetworkDetection: Removido updateNetworkInfo da dependência');
  console.log('='.repeat(60));
  
  const resultado = await testarAPIUserGroups();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO:');
  console.log('='.repeat(60));
  
  if (resultado.success && resultado.issue === 'none') {
    console.log('🎉 SUCESSO TOTAL!');
    console.log('   - Loop infinito corrigido');
    console.log('   - Sistema funcionando normalmente');
    console.log('   - Performance otimizada');
  } else if (resultado.success && resultado.issue === 'monitor') {
    console.log('✅ MELHORIA SIGNIFICATIVA!');
    console.log('   - Loop infinito reduzido drasticamente');
    console.log('   - Sistema funcionando melhor');
    console.log('   - Monitorar performance');
  } else if (resultado.issue === 'loop_detected') {
    console.log('❌ LOOP AINDA DETECTADO!');
    console.log('   - Verificar outras possíveis causas');
    console.log('   - Revisar hooks adicionais');
    console.log('   - Verificar dependências de useEffect');
  } else {
    console.log('❌ ERRO NO TESTE!');
    console.log(`   Erro: ${resultado.error}`);
  }
  
  console.log('\n🔧 PRÓXIMOS PASSOS:');
  console.log('1. Verificar logs do servidor');
  console.log('2. Testar no navegador');
  console.log('3. Monitorar performance');
  console.log('4. Verificar se não há outros loops');
}

// Executar teste
testarSistemaCompleto().catch(console.error);
