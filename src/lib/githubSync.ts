import { GitHubConfig, PopItem, Hospital } from '../types';

// Helper to get authorization headers, supporting both Bearer and token prefixes
function getGitHubHeaders(token: string): Record<string, string> {
  const cleanToken = token.trim();
  // Classic tokens (ghp_) often prefer the 'token' prefix, while modern ones use 'Bearer'
  // Using 'token' is generally safer for classic PATs in the v3 API
  const isClassic = cleanToken.startsWith('ghp_');
  const authHeader = isClassic ? `token ${cleanToken}` : `Bearer ${cleanToken}`;

  return {
    Authorization: authHeader,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

export async function testGitHubConnection(config: GitHubConfig): Promise<{ success: boolean; message: string }> {
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
  config: GitHubConfig
): Promise<{ success: boolean; message: string; lastSync?: string }> {
  if (!config.owner || !config.repo || !config.personalToken) {
    return {
      success: false,
      message: 'Token de Acesso Pessoal (PAT) do GitHub ou Repositório não configurado.',
    };
  }

  try {
    const headers = getGitHubHeaders(config.personalToken);
    const filePath = config.dataFilePath || 'pops_data.json';
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

    // Filter out examples before syncing to GitHub
    const popsToSync = pops.filter(p => !p.id.startsWith('example-'));

    // Step 2: Prepare JSON content & base64 encoding
    const jsonString = JSON.stringify(popsToSync, null, 2);
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
      message: `[EnfermaPOP] Atualização de POPs (${new Date().toLocaleString('pt-BR')})`,
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
  config: GitHubConfig
): Promise<{ success: boolean; message: string }> {
  if (!config.owner || !config.repo || !config.personalToken) {
    return {
      success: false,
      message: 'Configuração do GitHub ausente para hospitais.',
    };
  }

  try {
    const headers = getGitHubHeaders(config.personalToken);
    const filePath = config.hospitalsFilePath || 'hospitals.json';
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
      message: `[EnfermaPOP] Sincronização de Hospitais (${new Date().toLocaleString('pt-BR')})`,
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


