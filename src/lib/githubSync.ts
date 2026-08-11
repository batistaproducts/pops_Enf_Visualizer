/**
 * Antonio Batista - [POPs Enfermagem] - 2026-08-10
 */
import { GitHubConfig, PopItem, Hospital } from '../types';

// Helper para obter cabeçalhos de autorização do GitHub
function getGitHubHeaders(token: string): Record<string, string> {
  const cleanToken = token.trim();
  // Tokens clássicos (ghp_) funcionam bem com 'token' ou 'Bearer', mas 'Bearer' é o padrão moderno.
  // Fine-grained tokens (github_pat_) EXIGEM o prefixo 'Bearer'.
  // Para máxima compatibilidade, detectamos se é clássico.
  const isClassic = cleanToken.startsWith('ghp_');
  const authHeader = isClassic ? `token ${cleanToken}` : `Bearer ${cleanToken}`;

  return {
    'Authorization': authHeader,
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

export async function testGitHubConnection(config: GitHubConfig): Promise<{ success: boolean; message: string }> {
  console.log('Antonio Batista - [POPs Enfermagem] - Testando conexão com GitHub');
  if (!config.owner || !config.repo || !config.personalToken) {
    return { success: false, message: 'Owner, repo ou token não informados.' };
  }

  try {
    const headers = getGitHubHeaders(config.personalToken);
    const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
      method: 'GET',
      headers,
    });

    if (res.ok) {
      return { success: true, message: `Conexão bem-sucedida com ${config.owner}/${config.repo}!` };
    }

    const errData = await res.json().catch(() => ({}));
    if (res.status === 401) {
      return { success: false, message: 'Erro 401: Bad credentials. Verifique se o seu Personal Access Token está correto, não expirou e possui as permissões necessárias.' };
    }
    if (res.status === 404) {
      return { success: false, message: `Erro 404: O repositório ${config.owner}/${config.repo} não foi encontrado ou o token não tem permissão para acessá-lo.` };
    }

    return { success: false, message: `Erro na API do GitHub (${res.status}): ${errData.message || res.statusText}` };
  } catch (error) {
    return { success: false, message: `Erro de conexão: ${(error as Error).message}` };
  }
}

export async function fetchGitHubCommitsAndFiles(config: GitHubConfig): Promise<{ success: boolean; commits?: any[]; message?: string }> {
  if (!config.owner || !config.repo || !config.personalToken) {
    return { success: false, message: 'Configuração incompleta.' };
  }

  try {
    const headers = getGitHubHeaders(config.personalToken);
    const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/commits`, {
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: `Erro ao buscar commits: ${err.message || res.statusText}` };
    }

    const commits = await res.json();
    return { success: true, commits };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function syncPopsToGitHub(
  pops: PopItem[],
  config: GitHubConfig,
  customMessage?: string
): Promise<{ success: boolean; message: string; lastSync?: string }> {
  if (!config.owner || !config.repo || !config.personalToken) {
    return {
      success: false,
      message: 'Token de Acesso Pessoal (PAT) do GitHub ou Repositório não configurado.',
    };
  }

  try {
    const headers = getGitHubHeaders(config.personalToken);
    const filePath = config.dataFilePath || 'public/pops_data.json';
    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch || 'main'}`;

    // Step 1: Get existing file SHA if present
    let sha: string | undefined = undefined;
    try {
      const getRes = await fetch(apiUrl, { headers });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }
    } catch {
      // SHA might remain undefined for new file
    }

    // Step 2: Prepare JSON content & base64 encoding (UTF-8 safe)
    const jsonString = JSON.stringify(pops, null, 2);
    const base64Content = btoa(
      encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, function (_, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );

    const putBody: {
      message: string;
      content: string;
      branch: string;
      sha?: string;
    } = {
      message: customMessage || `[EnfermaPOP] Atualização de POPs (${new Date().toLocaleString('pt-BR')})`,
      content: base64Content,
      branch: config.branch || 'main',
    };

    if (sha) {
      putBody.sha = sha;
    }

    const putRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      if (putRes.status === 401) {
        return { success: false, message: 'Erro 401: Bad credentials. Verifique seu token de acesso.' };
      }
      return {
        success: false,
        message: `Erro na API do GitHub (${putRes.status}): ${errData.message || 'Falha ao atualizar repositório.'}`,
      };
    }

    const now = new Date().toISOString();
    return {
      success: true,
      message: 'Alterações sincronizadas e commitadas com sucesso no GitHub!',
      lastSync: now,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro de conexão com o GitHub: ${(error as Error).message}`,
    };
  }
}

export async function syncHospitalsToGitHub(
  hospitals: Hospital[],
  config: GitHubConfig,
  customMessage?: string
): Promise<{ success: boolean; message: string }> {
  if (!config.owner || !config.repo || !config.personalToken) {
    return {
      success: false,
      message: 'Configuração do GitHub ausente para hospitais.',
    };
  }

  try {
    const headers = getGitHubHeaders(config.personalToken);
    const filePath = config.hospitalsFilePath || 'public/hospitals.json';
    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch || 'main'}`;

    let sha: string | undefined = undefined;
    try {
      const getRes = await fetch(apiUrl, { headers });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }
    } catch {
      // Ignore
    }

    const jsonString = JSON.stringify(hospitals, null, 2);
    const base64Content = btoa(
      encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, function (_, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );

    const putBody: {
      message: string;
      content: string;
      branch: string;
      sha?: string;
    } = {
      message: customMessage || `[EnfermaPOP] Sincronização de Hospitais (${new Date().toLocaleString('pt-BR')})`,
      content: base64Content,
      branch: config.branch || 'main',
    };

    if (sha) putBody.sha = sha;

    const putRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody),
    });

    if (putRes.ok) {
      return { success: true, message: 'Hospitais sincronizados no GitHub!' };
    } else {
      const err = await putRes.json().catch(() => ({}));
      return { success: false, message: err.message || 'Erro ao sincronizar hospitais' };
    }
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}


