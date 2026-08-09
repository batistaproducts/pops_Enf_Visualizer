import { GitHubConfig, PopItem, Hospital } from '../types';

export async function ensureGitHubRepositoryExists(config: GitHubConfig): Promise<{ success: boolean; message: string }> {
  if (!config.owner || !config.repo || !config.personalToken) {
    return { success: false, message: 'Owner, repo or token missing.' };
  }

  try {
    // 1. Check if repo exists
    const checkRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
      headers: {
        Authorization: `Bearer ${config.personalToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (checkRes.ok) {
      return { success: true, message: `Repositório ${config.owner}/${config.repo} já existe.` };
    }

    // 2. If not exists, try creating it under user or org
    // Try user endpoint first: POST /user/repos
    let createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.personalToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.repo,
        description: 'EnfermaPOP - Visualizador e Gestor de POPs de Enfermagem',
        private: false,
        auto_init: true,
      }),
    });

    if (createRes.ok) {
      return { success: true, message: `Repositório ${config.owner}/${config.repo} criado com sucesso!` };
    }

    // Try org endpoint if user endpoint failed: POST /orgs/{org}/repos
    createRes = await fetch(`https://api.github.com/orgs/${config.owner}/repos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.personalToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.repo,
        description: 'EnfermaPOP - Visualizador e Gestor de POPs de Enfermagem',
        private: false,
        auto_init: true,
      }),
    });

    if (createRes.ok) {
      return { success: true, message: `Repositório ${config.owner}/${config.repo} criado na organização!` };
    }

    const err = await createRes.json();
    return { success: false, message: `Falha ao criar repositório: ${err.message || 'Erro desconhecido'}` };
  } catch (error) {
    return { success: false, message: `Erro ao verificar/criar repositório: ${(error as Error).message}` };
  }
}

export async function fetchGitHubCommitsAndFiles(config: GitHubConfig): Promise<{ success: boolean; commits?: any[]; message?: string }> {
  if (!config.owner || !config.repo || !config.personalToken) {
    return { success: false, message: 'Configuração incompleta.' };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/commits`, {
      headers: {
        Authorization: `Bearer ${config.personalToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: `Erro ao buscar commits: ${err.message}` };
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
      message: 'Token de Acesso Pessoal (PAT) do GitHub ou Repositório não configurado. As alterações foram salvas no armazenamento local.',
    };
  }

  try {
    // Ensure repo exists first
    await ensureGitHubRepositoryExists(config);

    const filePath = config.dataFilePath || 'pops_data.json';
    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch || 'main'}`;

    // Step 1: Get existing file SHA if present
    let sha: string | undefined = undefined;
    try {
      const getRes = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${config.personalToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }
    } catch {
      // SHA might remain undefined for new file
    }

    // Step 2: Prepare JSON content & base64 encoding
    const jsonString = JSON.stringify(pops, null, 2);
    // Universal UTF-8 base64 encoding in browser
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
      headers: {
        Authorization: `Bearer ${config.personalToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
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
    const filePath = config.hospitalsFilePath || 'hospitals.json';
    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch || 'main'}`;

    let sha: string | undefined = undefined;
    try {
      const getRes = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${config.personalToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
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
      headers: {
        Authorization: `Bearer ${config.personalToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(putBody),
    });

    if (putRes.ok) {
      return { success: true, message: 'Hospitais sincronizados no GitHub!' };
    } else {
      const err = await putRes.json();
      return { success: false, message: err.message };
    }
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

