import httpx
import uuid
import json

BASE = 'http://127.0.0.1:8000/api/v1'
email = f'researcher_{uuid.uuid4().hex[:6]}@evaluator.org'
password = 'Password123!'

with httpx.Client(base_url=BASE, timeout=10.0) as client:
    print('1. Testing Registration...')
    reg = client.post('/auth/register', json={'email': email, 'password': password, 'full_name': 'Test Evaluator'})
    assert reg.status_code == 200, f'Registration failed: {reg.text}'
    token = reg.json()['access_token']
    auth_headers = {'Authorization': f'Bearer {token}'}
    print('   -> Registered:', email)

    print('2. Testing Login...')
    login = client.post('/auth/login', json={'email': email, 'password': password})
    assert login.status_code == 200, f'Login failed: {login.text}'
    print('   -> Login OK')

    print('3. Testing Dashboard stats for fresh user...')
    dash = client.get('/dashboard/stats', headers=auth_headers).json()
    assert dash['total_analyses'] == 0, 'Initial total should be 0'
    assert dash['high_quality_ratio'] is None, 'Initial high_quality_ratio should be None/null for 0 analyses'
    print('   -> Fresh user dashboard metrics verified (total: 0, high_quality_ratio: None/NA)')

    print('4. Testing Invalid IP validation...')
    val_bad = client.post('/analysis/validate', json={'ip_address': '999.999.999.999'}).json()
    assert val_bad['is_valid'] == False, 'Should be invalid'
    print('   -> Invalid IP rejected correctly:', val_bad['explanation'][:50])

    print('5. Testing Private IP scope restriction...')
    val_priv = client.post('/analysis/validate', json={'ip_address': '192.168.1.1'}).json()
    assert val_priv['is_public'] == False and val_priv['category'] == 'private'
    priv_analysis = client.post('/analysis/analyze', json={'ip_address': '192.168.1.1'}, headers=auth_headers).json()
    assert priv_analysis['is_public'] == False
    assert 'PRIVATE' in priv_analysis['summary'] or 'private' in priv_analysis['summary'].lower()
    print('   -> Private IP RFC compliance verified')

    print('6. Testing Public IPv6 validation...')
    val_v6 = client.post('/analysis/validate', json={'ip_address': '2606:4700:4700::1111'}).json()
    assert val_v6['is_valid'] == True and val_v6['version'] == 6 and val_v6['is_public'] == True
    print('   -> IPv6 validated correctly')

    print('7. Testing Predefined Demo Scenarios...')
    scenarios = ['residential_clear', 'datacenter_clear', 'mobile_carrier', 'conflicting_signals', 'insufficient_evidence']
    created_ids = []
    for sc in scenarios:
        res = client.post('/analysis/analyze', json={'ip_address': '1.1.1.1', 'force_demo': True, 'demo_case_id': sc}, headers=auth_headers).json()
        created_ids.append(res['id'])
        print(f'   -> Scenario {sc}: verdict="{res["network_type"]}", conf={res["confidence_score"]}, quality={res["evidence_quality"]}, demo={res["is_demo"]}')

    print('8. Testing Report Retrieval & JSON Export...')
    rep = client.get(f'/analysis/{created_ids[0]}', headers=auth_headers).json()
    assert rep['network_type'] == 'Residential'
    assert len(rep['evidence']) > 0
    assert 'nodes' in rep['graph'] and len(rep['graph']['nodes']) > 0
    print('   -> Report & Graph data retrieved cleanly')

    print('9. Testing Comparison between 2 reports...')
    cmp_res = client.post('/analysis/compare', json={'analysis_id_a': created_ids[0], 'analysis_id_b': created_ids[1]}, headers=auth_headers).json()
    assert len(cmp_res['detected_changes']) > 0
    print('   -> Comparison detected changes:', cmp_res['detected_changes'])

    print('10. Testing CSV Benchmark Evaluation...')
    csv_data = 'ip_address,ground_truth,notes\n73.168.45.112,Residential,Test 1\n54.214.12.89,Hosting / Datacenter,Test 2\n192.0.2.1,Unknown / Insufficient Evidence,Test 3\n'
    files = {'file': ('eval_test.csv', csv_data.encode('utf-8'), 'text/csv')}
    bm = client.post('/benchmark/upload-csv', files=files, headers=auth_headers).json()
    assert bm['total_samples'] == 3
    assert bm['overall_accuracy'] > 0
    assert 'macro_f1' in bm
    assert 'confusion_matrix' in bm
    print(f'   -> Custom CSV evaluated successfully: Accuracy={bm["overall_accuracy"]}%, Macro F1={bm["macro_f1"]}, Abstention Rate={bm["unknown_abstention_rate"]}%')

    print('11. Testing Updated Dashboard with populated records...')
    dash2 = client.get('/dashboard/stats', headers=auth_headers).json()
    assert dash2['total_analyses'] > 0
    assert dash2['high_quality_ratio'] is not None
    print(f'   -> Populated Dashboard: Total={dash2["total_analyses"]}, Live={dash2["live_analyses_count"]}, Demo={dash2["demo_analyses_count"]}, High Quality Ratio={dash2["high_quality_ratio"]}%, Conflicts={dash2["conflicts_count"]}')

    print('\nALL 11 END-TO-END WORKFLOW CHECKS PASSED!')
