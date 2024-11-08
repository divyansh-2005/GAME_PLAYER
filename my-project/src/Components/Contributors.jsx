import React, { useState, useEffect } from "react";
import Header from "./Header";
import  './Contributors.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import LoaderWrapper from "./LoaderWrapper";




function Contributors() {
  const [contributors, setContributors] = useState([]);
    const [repoStats, setRepoStats] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch data from GitHub API
    const fetchData = async () => {
        try {
            const contributorsResponse = await fetch('https://api.github.com/repos/divyansh-2005/GAME_PLAYER/contributors');
            const contributorsData = await contributorsResponse.json();

            const repoResponse = await fetch('https://api.github.com/repos/divyansh-2005/GAME_PLAYER');
            const repoData = await repoResponse.json();

            setContributors(contributorsData);
            setRepoStats(repoData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setContributors([]);
            setRepoStats({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Render stats
    const renderStats = () => {
        const contributorsCount = contributors.length;
        const stats = [
            { label: 'Contributors', value: contributorsCount, icon: 'users' },
            { label: 'Total Contributions', value: contributors.reduce((sum, contributor) => sum + contributor.contributions, 0) || 0, icon: 'git-commit' },
            { label: 'GitHub Stars', value: repoStats.stargazers_count || 0, icon: 'star' },
            { label: 'Forks', value: repoStats.forks_count || 0, icon: 'git-branch' }
        ];

        return (
            <div className="contributor-stats-grid" id="statsGrid">
                {stats.map(stat => (
                    <div className="contributor-stat-card" key={stat.label}>
                        <div className="contributor-icon" dangerouslySetInnerHTML={{ __html: getIcon(stat.icon) }} />
                        <h3>{stat.value}</h3>
                        <p>{stat.label}</p>
                    </div>
                ))}
            </div>
        );
    };

    // Render contributors
    const renderContributors = () => {
        return (
            <div className="contributor-contributors-grid" id="contributorsGrid">
                {contributors.map(contributor => (
                    <div className="contributor-contributor-card" key={contributor.login}>
                        <img src={contributor.avatar_url} alt={contributor.login} />
                        <h3>{contributor.login}</h3>
                        <p>{contributor.type}</p>
                        <div className="contributor-contributions">{contributor.contributions} contributions</div>
                        <div className="contributor-footer">
                            <a href={contributor.html_url} target="_blank" rel="noopener noreferrer">
                                {getIcon('external-link')}
                                <FontAwesomeIcon icon={faGithub} />
                            </a>
                            {getIcon('github')}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Helper function to get icons
    const getIcon = (name) => {
        const icons = {
            //    svg icons 
        };
        return icons[name] || '';
    };

    return (
        <>
            <Header />
            <section className="contributor-contributors">
                {loading ? (
                    <LoaderWrapper />
                ) : (
                    <>
                        <h2>Project Statistics</h2>
                        {renderStats()}
                        <h2>Meet Our Contributors</h2>
                        {renderContributors()}
                    </>
                )}
            </section>
    </>
  );
}

export default Contributors;

